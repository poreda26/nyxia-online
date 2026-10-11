export function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function uid() { return Math.random().toString(36).slice(2, 10); }
