import type { Session } from "../types";
import { normalizeSession, slug } from "./session";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64ToBytes(payload: string): Uint8Array {
  const b64 = payload.replaceAll("-", "+").replaceAll("_", "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encodeSession(session: Session): Promise<string> {
  const stream = new Blob([JSON.stringify(session)]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return bytesToBase64(bytes);
}

export async function decodeSession(payload: string): Promise<Session> {
  const stream = new Blob([bytesToBase64Buffer(payload)])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  const data: unknown = JSON.parse(text);
  const session = normalizeSession(data);
  if (!session) throw new Error("This link does not contain a session.");
  return session;
}

function bytesToBase64Buffer(payload: string): Uint8Array<ArrayBuffer> {
  const bytes = base64ToBytes(payload);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

export async function shareUrl(session: Session): Promise<string> {
  const code = await encodeSession(session);
  const url = `${location.origin}${location.pathname}#/board?d=${code}`;
  if (url.length > 14000) {
    throw new Error("This session is too detailed for a link. Export the JSON instead.");
  }
  return url;
}

export function downloadSession(session: Session): void {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug(session.title)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
