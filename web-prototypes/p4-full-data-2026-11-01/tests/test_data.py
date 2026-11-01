import json,unittest,urllib.request,urllib.error,sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from scripts.sync_data import build,ROOT,PRIVATE
from server import Catalog
URL='http://127.0.0.1:8791'
def get(path):
 with urllib.request.urlopen(URL+path) as r:return r.status,r.headers,r.read()
class DataIntegration(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.data=json.loads((PRIVATE/'catalog.json').read_text())
 def test_all_rows_relations_and_api(self):
  d=self.data;public=json.loads(get('/api/catalog')[2]);self.assertEqual(len(public['chapters']),24);self.assertEqual(len(public['terms']),101)
  self.assertEqual(sum('已上线' in t['state'] for t in d['terms']),55)
  for c in d['chapters']:
   self.assertEqual({t['id'] for t in d['terms'] if c['name'] in t['chapterNames']},set(c['termIds']))
   self.assertEqual(json.loads(get('/api/chapters/'+c['id'])[2])['id'],c['id'])
  for t in d['terms']:
   full=json.loads(get('/api/terms/'+t['id'])[2]);self.assertEqual(set(t['caseIds']),{c['id'] for c in full['cases']});self.assertTrue(all(c['termName']==t['name'] for c in full['cases']))
   if '已上线' not in t['state']:self.assertEqual(t['cover'],'')
  for c in d['cases']:self.assertEqual(json.loads(get('/api/cases/'+c['id'])[2])['id'],c['id'])
 def test_media_complete_and_private_fields_absent(self):
  raw=json.dumps(self.data,ensure_ascii=False);self.assertNotIn('file_token',raw);self.assertNotIn('access_token',raw);self.assertTrue(all('正文' not in t for t in self.data['terms']))
  files=list((ROOT/'public/media').iterdir());self.assertEqual(len(files),407)
  for file in files:
   self.assertGreater(file.stat().st_size,0)
   with urllib.request.urlopen(urllib.request.Request(URL+'/media/'+file.name,method='HEAD')) as r:self.assertEqual(int(r.headers['Content-Length']),file.stat().st_size)
  p3=get('/api/p3-topics.js')[2].decode();self.assertNotIn('fileToken',p3);self.assertNotIn('base',p3)
 def test_no_private_routes_and_cache(self):
  for path in ['/private/catalog.json','/%2e%2e/private/catalog.json','/server.py','/api/terms/missing']:
   with self.assertRaises(urllib.error.HTTPError) as error:get(path)
   self.assertEqual(error.exception.code,404)
  _,headers,body=get('/api/catalog')
  with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(urllib.request.Request(URL+'/api/catalog',headers={'If-None-Match':headers['ETag']}))
  self.assertEqual(error.exception.code,304);self.assertEqual(headers['Cache-Control'],'no-cache')
 def test_last_good_snapshot_survives_sync_failure(self):
  s=Catalog();before=s.data
  with patch('server.sync',side_effect=RuntimeError('simulated offline')):s.refresh()
  self.assertTrue(s.failed);self.assertIs(s.data,before)
 def test_order_membership_unkept_cases_and_unknown_relation(self):
  raw={'chapters':[{'record_id':'c','章节名':'章','词条':'乙,甲'}],'terms':[{'record_id':'a','词':'甲','所属章节':['章'],'状态':['已上线']},{'record_id':'b','词':'乙','所属章节':['章'],'状态':['更新中']}],'cases':[{'record_id':'keep','作品名':'真','所属词条':'甲','是否保留':True},{'record_id':'drop','作品名':'删','所属词条':'甲','是否保留':False}],'sections':[]}
  d=build(raw,{},{});self.assertEqual(d['chapters'][0]['termIds'],['b','a']);self.assertEqual(d['terms'][0]['caseIds'],['keep']);self.assertEqual(len(d['cases']),1)
  raw['terms'][0]['所属章节']=['不存在']
  with self.assertRaises(RuntimeError):build(raw,{}, {})
if __name__=='__main__':unittest.main(verbosity=2)
