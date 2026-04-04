import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

export async function extractAudio(videoFile: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp3';

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
  
  // Extract audio at 128k quality
  await ffmpeg.exec(['-i', inputName, '-vn', '-ab', '128k', '-ar', '44100', '-y', outputName]);

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'audio/mp3' });
}

export async function mergeAudio(videoFile: File, dubbedAudioBlob: Blob): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const videoName = 'video.mp4';
  const audioName = 'dub.mp3';
  const outputName = 'dubbed_video.mp4';

  await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
  await ffmpeg.writeFile(audioName, await fetchFile(dubbedAudioBlob));

  // Replace video audio with dubbed audio
  // -c:v copy (copy video stream) -c:a aac (encode audio to aac) -map 0:v:0 -map 1:a:0 (map first video and first audio)
  await ffmpeg.exec([
    '-i', videoName, 
    '-i', audioName, 
    '-c:v', 'copy', 
    '-c:a', 'aac', 
    '-map', '0:v:0', 
    '-map', '1:a:0', 
    '-shortest', 
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'video/mp4' });
}
