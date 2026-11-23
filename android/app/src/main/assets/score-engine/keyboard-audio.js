const keyboardAudio=(()=>{
 let context=null;const voices=new Map();
 function stop(note){const voice=voices.get(note);if(!voice)return;voices.delete(note);const now=context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(0,now,0.03);voice.oscillator.stop(now+0.18)}
 function start(note){
  if(!Number.isInteger(note)||note<21||note>108)return;
  context ||= new(window.AudioContext||window.webkitAudioContext)();context.resume().catch(showError);stop(note);
  const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  oscillator.type='triangle';oscillator.frequency.value=440*Math.pow(2,(note-69)/12);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(0.18*volume,now+0.008);gain.gain.setTargetAtTime(0.07*volume,now+0.02,0.3);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start();
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};voices.set(note,{oscillator,gain});
 }
 function reset(){for(const note of voices.keys())stop(note)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 return {start,stop,reset};
})();
