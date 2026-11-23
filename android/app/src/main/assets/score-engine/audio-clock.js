/* Shared output for score PCM, metronome and keyboard preview. */
const scoreAudio=(()=>{
 let context;
 function clock(){return context ||= new (window.AudioContext||window.webkitAudioContext)()}
 return {context:clock};
})();
