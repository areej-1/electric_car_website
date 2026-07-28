// Extracts evenly-spaced full-resolution frames from a video, for feeding into
// Object Capture. Exists because walking around the car with a phone camera rolling
// is far easier than taking 150 individual photographs, and photogrammetry does not
// care which way the images arrived.
//
// Build:
//   swiftc -O frames.swift -o frames
//
// Run:
//   ./frames <video> <output-folder> [count] [maxEdge]
//
//   count   : how many frames to pull, evenly spaced (default 150)
//   maxEdge : longest edge in pixels, 0 = native (default 0)
//
// Typical:
//   ./frames walkaround.MOV ./photos 150
//   ./capture ./photos ./kart.obj reduced

import AVFoundation
import AppKit
import Foundation

func die(_ m: String) -> Never {
    FileHandle.standardError.write((m + "\n").data(using: .utf8)!)
    exit(1)
}

let a = CommandLine.arguments
guard a.count >= 3 else { die("usage: frames <video> <output-folder> [count] [maxEdge]") }

let videoURL = URL(fileURLWithPath: a[1])
let outDir = URL(fileURLWithPath: a[2], isDirectory: true)
let count = a.count >= 4 ? (Int(a[3]) ?? 150) : 150
let maxEdge = a.count >= 5 ? (Int(a[4]) ?? 0) : 0

guard FileManager.default.fileExists(atPath: videoURL.path) else { die("no such video: \(videoURL.path)") }
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: videoURL)
var duration: Double = 0
var naturalSize = CGSize.zero
let sem = DispatchSemaphore(value: 0)
Task {
    if let d = try? await asset.load(.duration) { duration = CMTimeGetSeconds(d) }
    if let track = try? await asset.loadTracks(withMediaType: .video).first,
       let s = try? await track.load(.naturalSize) { naturalSize = s }
    sem.signal()
}
sem.wait()
guard duration > 0 else { die("could not read duration — is this a video file?") }

let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
if maxEdge > 0 { gen.maximumSize = CGSize(width: maxEdge, height: maxEdge) }

print("frames")
print("  video  : \(videoURL.lastPathComponent)  \(String(format: "%.1f", duration))s  \(Int(naturalSize.width))×\(Int(naturalSize.height))")
print("  output : \(outDir.path)")
print("  pulling \(count) frames\(maxEdge > 0 ? ", max edge \(maxEdge)px" : " at native resolution")")
print("")

var written = 0
for i in 0..<count {
    let t = duration * (Double(i) + 0.5) / Double(count)
    let time = CMTime(seconds: t, preferredTimescale: 600)
    guard let cg = try? gen.copyCGImage(at: time, actualTime: nil) else { continue }
    let rep = NSBitmapImageRep(cgImage: cg)
    guard let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.95]) else { continue }
    let name = String(format: "frame-%04d.jpg", i)
    try? data.write(to: outDir.appendingPathComponent(name))
    written += 1
    if written % 10 == 0 { print("\r  \(written)/\(count)", terminator: ""); fflush(stdout) }
}
print("\r  \(written)/\(count) frames written")
if written < count { print("  note: \(count - written) frames could not be decoded and were skipped") }
