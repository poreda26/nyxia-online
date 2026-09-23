"""Original Nyxia score. Rebuild: numpy, scipy, imageio-ffmpeg; no external samples.
48 bars, 72 BPM, D minor/modal colors. Deterministic synthesis and room response.
"""
from pathlib import Path
import subprocess
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io.wavfile import write
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output'; OUT.mkdir(exist_ok=True)
ASSETS=ROOT/'src/assets/audio'; ASSETS.mkdir(exist_ok=True)
SR=32000; BEAT=60/72; BAR=4*BEAT; DURATION=48*BAR
N=round(DURATION*SR); rng=np.random.default_rng(7219)
mix=np.zeros((N,2),dtype=np.float32)

def add(midi,start,duration,amp,kind='flute',pan=0):
 f=440*2**((midi-69)/12); t=np.arange(round((duration+1.3)*SR))/SR
 vibrato=.0015*np.sin(2*np.pi*4.7*t)*np.minimum(t/.6,1)
 phase=2*np.pi*f*(t+vibrato/(2*np.pi*4.7))
 if kind=='flute':
  wave=np.sin(phase)+.18*np.sin(2*phase)+.045*np.sin(3*phase)
  breath=sosfilt(butter(2,[700,2400],btype='bandpass',fs=SR,output='sos'),rng.standard_normal(len(t)))
  wave+=.055*breath
  env=np.minimum(t/.16,1)*np.exp(-.1*t)*np.clip((duration+.38-t)/.55,0,1)
 elif kind=='harp':
  wave=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(1.25+.42*k)) for k,a in [(1,1),(2,.42),(3,.2),(4,.065)])
  env=np.minimum(t/.009,1)*np.clip((duration+1.1-t)/.4,0,1)
 elif kind=='strings':
  wave=np.zeros(len(t))
  for detune in [-.0021,.0017]:
   for k in range(1,7):
    wave+=np.sin(2*np.pi*f*(1+detune)*k*t+.2*np.sin(2*np.pi*.3*t))/(k**1.65)*.45
  env=np.minimum(t/.9,1)*np.clip((duration+.85-t)/1.25,0,1)*(.96+.04*np.sin(2*np.pi*.7*t))
 else:
  wave=np.sin(phase)+.2*np.sin(2*phase)+.06*np.sin(3*phase)
  env=np.minimum(t/.22,1)*np.clip((duration+.45-t)/.7,0,1)
 wave=(wave*env*amp).astype(np.float32)
 pos=round(start*SR); idx=(pos+np.arange(len(t)))%N
 mix[idx,0]+=wave*np.sqrt((1-pan)/2);mix[idx,1]+=wave*np.sqrt((1+pan)/2)

# MIDI chord voicings, spacious ninths and suspended cadences.
chords=[(38,[50,57,60,64]),(34,[53,57,60,62]),(41,[53,57,60,67]),(36,[52,55,60,62]),
        (43,[53,57,58,62]),(38,[53,57,60,64]),(34,[50,53,57,60]),(33,[52,57,59,62])]
# Each entry: beat, MIDI note, duration in beats. Deliberate breathing rests.
a=[[(.6,74,1.4),(2.4,72,.7),(3.2,69,.6)],[(0,65,2),(2.5,69,1)],
   [(.4,67,1),(1.8,69,1.7)],[(0,72,2.2),(3,67,.65)],
   [(.6,70,1.2),(2.2,69,.7),(3.1,67,.7)],[(0,65,1.5),(2.3,64,.7),(3.2,62,.6)],
   [(.5,65,1),(2,69,1.5)],[(0,64,1.8),(2.5,62,1)]]
b=[[(0,69,1.7),(2.4,74,1.2)],[(.3,77,1.6),(2.5,74,1)],
   [(0,76,1),(1.4,72,1),(2.8,69,.8)],[(.6,67,2.5)],
   [(0,74,1.2),(1.8,77,.8),(3,74,.7)],[(.3,72,1.4),(2.2,69,1.3)],
   [(0,70,1.6),(2.3,69,1)],[(.3,64,1.2),(2,62,1.6)]]
for bar in range(48):
 section=bar//8; bass,notes=chords[bar%8]; start=bar*BAR
 density=[.72,.85,1,.78,.92,.63][section]
 add(bass,start,3.5*BEAT,.075*density,'bass',-.06)
 for i,note in enumerate(notes):add(note,start+i*.025,3.8*BEAT,.024*density,'strings',(i-1.5)*.32)
 pattern=[0,2,1,3,2,1] if section in [1,2,4] else [0,2,1,3]
 for j,k in enumerate(pattern):
  at=j*(4/len(pattern))*BEAT+.035
  add(notes[k]+12,start+at,.9,.032*density,'harp',(-.45 if j%2==0 else .42))
 # Intro/outro remain sparse; middle section introduces a second phrase.
 if section not in [0,5] or bar%8>=4 and section==0 or bar%8<4 and section==5:
  for beat,note,dur in (b if section in [2,4] else a)[bar%8]:
   add(note,start+beat*BEAT,dur*BEAT,.105*density,'flute',-.13)
 if section==3 and bar%2==0:
  add(notes[1]+12,start+2*BEAT,1.4*BEAT,.028,'flute',.35)
 # Quiet frame drum, never a loud repetitive kick/snare groove.
 if section in [2,4] and bar%2==0:
  t=np.arange(int(.55*SR))/SR
  drum=.04*np.sin(2*np.pi*(78*t+1.8*(1-np.exp(-t*18))))*np.exp(-t*11)
  drum+=.014*sosfilt(butter(2,450,fs=SR,output='sos'),rng.standard_normal(len(t)))*np.exp(-t*22)
  idx=round(start*SR)+np.arange(len(t));mix[idx]+=drum[:,None]

# Stereo room: early reflections + soft, filtered diffuse tail. Wrap tails into
# start to preserve musical continuity at the loop boundary.
for ch in range(2):
 length=int(2.7*SR);t=np.arange(length)/SR
 ir=rng.standard_normal(length)*np.exp(-t/0.52)
 ir=sosfilt(butter(2,3600,fs=SR,output='sos'),ir)
 ir[:int(.025*SR)]=0;ir*=.19/np.sqrt(np.sum(ir**2))
 for delay,gain in [(.067,.14),(.113,.1),(.191,.07)]:ir[int((delay+ch*.009)*SR)]+=gain
 wet=fftconvolve(mix[:,ch],ir).astype(np.float32)
 mix[:,ch]+=wet[:N];mix[:len(wet)-N,ch]+=wet[N:]
mix=sosfilt(butter(2,40,btype='highpass',fs=SR,output='sos'),mix,axis=0)
peak=np.max(np.abs(mix));mix*=.63/max(peak,1e-8)
# A tiny seam interpolation prevents encoder/filter boundary clicks.
edge=round(.006*SR)
for ch in range(2):mix[:edge,ch]+=np.linspace(mix[-1,ch]-mix[0,ch],0,edge)
wave=OUT/'nyxia-mist-valley.wav';write(wave,SR,(mix*32767).astype(np.int16))
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ffmpeg,'-y','-v','error','-i',str(wave),'-codec:a','libmp3lame','-b:a','128k',str(ASSETS/'mist-valley.mp3')],check=True)
subprocess.run([ffmpeg,'-y','-v','error','-ss','23','-i',str(wave),'-t','40','-af','afade=t=in:d=1,afade=t=out:st=37:d=3','-codec:a','libmp3lame','-b:a','160k',str(OUT/'nyxia-music-preview.mp3')],check=True)
print(f'Original score: {DURATION:.1f}s; peak {np.max(abs(mix)):.3f}; RMS {np.sqrt(np.mean(mix**2)):.3f}; MP3 {(ASSETS/"mist-valley.mp3").stat().st_size/1e6:.2f}MB')
