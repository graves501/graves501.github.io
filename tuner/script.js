"use strict";
const SIXTY_SECONDS_IN_MS = 60000;
const BPM_120 = 120;

let tapCount = 0;
let tapStart = 0;
let tapPrevious = 0;
let delayInMs = SIXTY_SECONDS_IN_MS / BPM_120;
let tickLoop;
let bpmAverage = 0;
let isTickPlaying = false;
let audioctx = new AudioContext();

function playBeep() {
  let oscillator = audioctx.createOscillator();
  let audioGain = audioctx.createGain();
  oscillator.connect(audioGain);
  audioGain.connect(audioctx.destination);
  oscillator.start(0);
  audioGain.gain.exponentialRampToValueAtTime(
    0.00001,
    audioctx.currentTime + 1
  );
}

function playSound(note) {
  let sound = new Audio("sounds/" + note + ".mp3");

  let timesPlayed = 0;
  let timesToBePlayed = 3;

  sound.onended = function() {
    timesPlayed++;

    if (timesPlayed < timesToBePlayed) {
      sound.play();
    }
  };

  sound.play();
}

function getTempo() {
  let tapTimer = Date.now();

  if (tapCount == 0) {
    tapStart = tapTimer;
    tapCount++;
  } else {
    bpmAverage = (SIXTY_SECONDS_IN_MS * tapCount) / (tapTimer - tapStart);
    bpmAverage = Math.round(bpmAverage);
    delayInMs = SIXTY_SECONDS_IN_MS / bpmAverage;
    setBpmText(bpmAverage);
    tapCount++;
  }
}

function setBpmText(bpmAverage) {
  let bpmText = document.getElementById("bpmText");
  bpmText.innerHTML = bpmAverage + "";
}

function resetTempo() {
  tapCount = 0;
  delayInMs = SIXTY_SECONDS_IN_MS / BPM_120;
  setBpmText(BPM_120);
  isTickPlaying = false;
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
}

function playTick() {
  isTickPlaying = !isTickPlaying;

  let startTime = new Date().getTime();
  let time = 0;

  function tickHandler() {
    if (!isTickPlaying) {
      return;
    }
    playBeep();

    time += delayInMs;
    let diff = new Date().getTime() - startTime - time;
    let adjustedDelayInMs = Math.abs(delayInMs - diff);
    setTimeout(tickHandler, adjustedDelayInMs);
  }

  setTimeout(tickHandler, delayInMs);
}
