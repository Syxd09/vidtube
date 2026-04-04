import { TranscriptEntry } from "./youtube";

function formatTimestamp(seconds: number, type: 'srt' | 'vtt'): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  const ms = Math.floor((seconds % 1) * (type === 'srt' ? 1000 : 1000));
  const time = date.toISOString().substr(11, 8);
  const msFormatted = ms.toString().padStart(3, '0');
  
  return type === 'srt' 
    ? `${time},${msFormatted}` 
    : `${time}.${msFormatted}`;
}

export function exportToSRT(transcript: TranscriptEntry[]): string {
  return transcript.map((entry, i) => {
    const start = formatTimestamp(entry.start, 'srt');
    const end = formatTimestamp(entry.start + entry.duration, 'srt');
    return `${i + 1}\n${start} --> ${end}\n${entry.text}\n`;
  }).join('\n');
}

export function exportToVTT(transcript: TranscriptEntry[]): string {
  let vtt = "WEBVTT\n\n";
  vtt += transcript.map((entry) => {
    const start = formatTimestamp(entry.start, 'vtt');
    const end = formatTimestamp(entry.start + entry.duration, 'vtt');
    return `${start} --> ${end}\n${entry.text}\n`;
  }).join('\n');
  return vtt;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
