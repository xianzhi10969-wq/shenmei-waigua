import Foundation
import Vision
import CoreImage
import AppKit
let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(url: url)
try handler.perform([req])
guard let observation = req.results?.first else { fatalError("No mask") }
var ids = observation.allInstances
if args.count > 4 {
 let px = Double(args[3])!, py = Double(args[4])!
 let buffer=observation.instanceMask
 CVPixelBufferLockBaseAddress(buffer,.readOnly)
 let x=Int(px*Double(CVPixelBufferGetWidth(buffer))), y=Int(py*Double(CVPixelBufferGetHeight(buffer)))
 let base=CVPixelBufferGetBaseAddress(buffer)!.assumingMemoryBound(to: UInt8.self)
 let id=Int(base[y*CVPixelBufferGetBytesPerRow(buffer)+x])
 CVPixelBufferUnlockBaseAddress(buffer,.readOnly)
 if id>0 {ids=IndexSet(integer:id)}
 print("selected",id,"of",observation.allInstances)
}
let maskBuffer=try observation.generateScaledMaskForImage(forInstances: ids, from: handler)
let mask=CIImage(cvPixelBuffer: maskBuffer).applyingFilter("CIMorphologyMinimum", parameters:[kCIInputRadiusKey: args.count > 5 ? Double(args[5])! : 1.5])
let input=CIImage(contentsOf: url)!
let output=input.applyingFilter("CIBlendWithMask",parameters:[kCIInputBackgroundImageKey:CIImage(color:.clear).cropped(to:input.extent),kCIInputMaskImageKey:mask])
let context=CIContext()
try context.writePNGRepresentation(of:output,to:URL(fileURLWithPath:args[2]),format:.RGBA8,colorSpace:CGColorSpace(name:CGColorSpace.sRGB)!)
print("saved",args[2])
