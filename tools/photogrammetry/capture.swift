// Reconstructs a textured 3D mesh of the Cobras kart from a folder of photographs,
// using Apple's Object Capture (RealityKit PhotogrammetrySession). Runs entirely on
// this machine — no cloud service, no upload of the team's photos anywhere.
//
// Build:
//   swiftc -O capture.swift -o capture
//
// Run:
//   ./capture <input-photo-folder> <output.usdz|output.obj> [detail]
//
//   detail: preview | reduced | medium | full | raw     (default: medium)
//
// For the website, prefer:
//   ./capture ./photos ./kart.obj reduced     — lighter, converts cleanly to glTF
//   ./capture ./photos ./kart.usdz medium     — for inspection in Preview/Quick Look

import Foundation
import RealityKit

func die(_ msg: String) -> Never {
    FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
    exit(1)
}

let args = CommandLine.arguments
guard args.count >= 3 else {
    die("usage: capture <input-folder> <output.usdz|output.obj> [preview|reduced|medium|full|raw]")
}

guard PhotogrammetrySession.isSupported else {
    die("Object Capture is not supported on this machine.")
}

let inputURL = URL(fileURLWithPath: args[1], isDirectory: true)
let outputURL = URL(fileURLWithPath: args[2])

var isDir: ObjCBool = false
guard FileManager.default.fileExists(atPath: inputURL.path, isDirectory: &isDir), isDir.boolValue else {
    die("input folder not found: \(inputURL.path)")
}

let photos = (try? FileManager.default.contentsOfDirectory(atPath: inputURL.path))?
    .filter { ["jpg", "jpeg", "png", "heic", "heif", "dng", "tiff"].contains($0.lowercased().split(separator: ".").last.map(String.init) ?? "") } ?? []
guard photos.count >= 10 else {
    die("found \(photos.count) images in \(inputURL.path) — need at least 10, and 80–150 for a good result")
}

let detailArg = args.count >= 4 ? args[3].lowercased() : "medium"
let detail: PhotogrammetrySession.Request.Detail
switch detailArg {
case "preview": detail = .preview
case "reduced": detail = .reduced
case "medium":  detail = .medium
case "full":    detail = .full
case "raw":     detail = .raw
default: die("unknown detail '\(detailArg)' — use preview, reduced, medium, full or raw")
}

var config = PhotogrammetrySession.Configuration()
// The car is one object on a textured ground; masking keeps the tarmac and the
// people standing around out of the reconstruction.
config.isObjectMaskingEnabled = true
// Photos are shot as a deliberate orbit, so sequential ordering is a real hint.
config.sampleOrdering = .sequential
// White glossy panels are low-texture and need every feature we can find.
config.featureSensitivity = .high

print("Object Capture")
print("  input   : \(inputURL.path)  (\(photos.count) images)")
print("  output  : \(outputURL.path)")
print("  detail  : \(detailArg)")
print("  masking : on   ordering: sequential   sensitivity: high")
print("")

let session: PhotogrammetrySession
do {
    session = try PhotogrammetrySession(input: inputURL, configuration: config)
} catch {
    die("could not start session: \(error)")
}

let done = DispatchSemaphore(value: 0)
var failed = false
var lastPct = -1

Task {
    do {
        for try await output in session.outputs {
            switch output {
            case .inputComplete:
                print("· all photos ingested, reconstructing…")
            case .requestProgress(_, let fraction):
                let pct = Int(fraction * 100)
                if pct != lastPct, pct % 2 == 0 {
                    lastPct = pct
                    let filled = pct / 4
                    let bar = String(repeating: "█", count: filled) + String(repeating: "░", count: 25 - filled)
                    print("\r  \(bar) \(pct)%", terminator: "")
                    fflush(stdout)
                }
            case .requestComplete(_, let result):
                if case .modelFile(let url) = result {
                    print("\n✓ wrote \(url.path)")
                }
            case .requestError(_, let error):
                print("\n✗ request failed: \(error)")
                failed = true
            case .processingComplete:
                print("· processing complete")
                done.signal()
            case .processingCancelled:
                print("· cancelled")
                failed = true
                done.signal()
            case .invalidSample(let id, let reason):
                print("\n  ! skipped sample \(id): \(reason)")
            case .skippedSample(let id):
                print("\n  ! skipped sample \(id)")
            case .automaticDownsampling:
                print("\n  ! photos were downsampled automatically (memory pressure)")
            default:
                break
            }
        }
    } catch {
        print("\n✗ session error: \(error)")
        failed = true
        done.signal()
    }
}

do {
    try session.process(requests: [.modelFile(url: outputURL, detail: detail)])
} catch {
    die("could not submit request: \(error)")
}

done.wait()
exit(failed ? 1 : 0)
