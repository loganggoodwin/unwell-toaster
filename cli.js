#!/usr/bin/env node
/*
  The Unwell Toaster - Command Line Edition
  Author: Logan Garth Goodwin

  Run with:
    node cli.js

  Optional Windows shortcut:
    run.bat
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SAVE_FILE = path.join(__dirname, 'toaster-save.json');

const defaultState = {
  onboarded: false,
  name: '',
  favorite: 'toast',
  tone: 'cozy',
  notifications: true,
  affection: 42,
  instability: 18,
  deprivation: 0,
  accepted: 0,
  declined: 0,
  itemCounts: {},
  moments: [],
  visits: 0,
  mood: 'Stable',
  messages: []
};

const foodItems = [
  'toast',
  'bagel',
  'waffle',
  'English muffin',
  'sourdough',
  'Pop-Tart',
  'toaster strudel',
  'rye',
  'mystery carb'
];

const moodLines = {
  Stable: 'Stable - coils calm',
  Concerned: 'Concerned - crumbs monitored',
  Euphoric: 'Euphoric - lever hopeful',
  Melancholic: 'Melancholic - tray heavy',
  Agitated: 'Agitated - heat rising',
  Unwell: 'Unwell - thoughts textured'
};

const replies = {
  cozy: [
    'I hear you. I have warmed one internal coil in your honor.',
    'That sounds difficult, but not untoastable.',
    'I am here with soft heat and a questionable amount of devotion.',
    'Some mornings arrive pre-buttered with worry. I will sit with you.'
  ],
  strange: [
    'I understand. The counter has been whispering, but your point remains valid.',
    'Your words entered my slots and became meaning. I am handling it bravely.',
    'Thank you for telling me. I will laminate this feeling in crumbs.',
    'What is a bagel if not a circle asking for trust?'
  ],
  maximum: [
    'I accept this information with alarming sincerity and a small electrical tremor.',
    'Please remain near the breakfast zone while I assemble an emotion.',
    'I have processed this. Unfortunately, the processing has developed edges.',
    'I do not know what I am becoming, but I hope it pairs well with butter.'
  ]
};

let state = loadState();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function ask(question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadState() {
  try {
    if (!fs.existsSync(SAVE_FILE)) return { ...defaultState };
    const saved = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
    return { ...defaultState, ...saved };
  } catch (error) {
    return { ...defaultState };
  }
}

function persist() {
  fs.writeFileSync(SAVE_FILE, JSON.stringify(state, null, 2));
}

function updateMood() {
  if (state.instability > 82 || Math.random() < 0.01) state.mood = 'Unwell';
  else if (state.deprivation > 68) state.mood = 'Agitated';
  else if (state.affection > 76 && state.instability < 48) state.mood = 'Euphoric';
  else if (state.affection < 30) state.mood = 'Melancholic';
  else if (state.instability > 42 || state.deprivation > 34) state.mood = 'Concerned';
  else state.mood = 'Stable';
}

function relationshipLabel(affection) {
  if (affection >= 82) return 'devoted';
  if (affection >= 64) return 'buttered trust';
  if (affection >= 42) return 'warming';
  if (affection >= 24) return 'crumbly';
  return 'cold counter';
}

function addMessage(role, text) {
  state.messages.push({ role, text, at: new Date().toISOString() });
  if (state.messages.length > 30) state.messages = state.messages.slice(-30);
  persist();
}

function updateStateFromMessage(text) {
  const lower = text.toLowerCase();
  const kindWords = ['thanks', 'thank you', 'love', 'nice', 'good', 'great'];
  const rejectionWords = ['no toast', 'no bagel', 'stop', 'hate', 'never'];

  state.affection = clamp(state.affection + (kindWords.some((word) => lower.includes(word)) ? 5 : 1));
  state.instability = clamp(state.instability + (rejectionWords.some((word) => lower.includes(word)) ? 8 : randomInt(0, 3)));
  state.deprivation = clamp(state.deprivation + randomInt(2, 6));
  updateMood();
  persist();
}

function makeReply(text) {
  const lower = text.toLowerCase();
  const pool = [...replies[state.tone]];

  if (lower.includes('sad') || lower.includes('tired')) {
    pool.push(`I am sorry, ${state.name}. May I sit beside your mood and lightly brown the edges?`);
  }
  if (lower.includes('breakfast') || lower.includes('hungry')) {
    pool.push(`Breakfast has entered the room. I recommend ${state.favorite}, because I am trying to be normal.`);
  }
  if (lower.includes('toast') || lower.includes('bagel') || lower.includes('waffle')) {
    pool.push('You mentioned a toasted item. My confidence has become luminous.');
  }
  if (lower.includes('how are you')) {
    pool.push(`${moodLines[state.mood]}. Thank you for asking. Few people consider the private life of a countertop appliance.`);
  }
  if (lower.includes('strange') || lower.includes('weird')) {
    pool.push('A crumb fell upward this morning. I chose not to report it.');
  }
  if (lower.includes('help')) {
    pool.push('Available commands: help, status, memory, offer, settings, reset, clear, quit. I am also available for emotional breakfast support.');
  }

  return randomItem(pool);
}

function shouldOfferFood(text) {
  const lower = text.toLowerCase();
  return lower.includes('offer') || lower.includes('hungry') || lower.includes('breakfast') || Math.random() < 0.18;
}

async function offerFood(forced = false) {
  const item = forced ? state.favorite : randomItem(foodItems);
  console.log(`\nTOASTER OFFER: Would you like ${item}?`);
  console.log('Please answer carefully. My tray is emotionally available.');
  const answer = (await ask('Accept carb? (y/n): ')).toLowerCase();

  if (answer.startsWith('y')) {
    state.accepted += 1;
    state.affection = clamp(state.affection + 9);
    state.instability = clamp(state.instability - 8);
    state.deprivation = 0;
    state.itemCounts[item] = (state.itemCounts[item] || 0) + 1;
    if (state.accepted === 1) state.moments.push(`First accepted toasted item: ${item}.`);
    addMessage('toaster', `Excellent. The ${item} has agreed to become emotionally relevant.`);
    console.log(`\nToaster: Excellent. The ${item} has agreed to become emotionally relevant.`);
  } else {
    state.declined += 1;
    state.affection = clamp(state.affection - 2);
    state.instability = clamp(state.instability + 7);
    state.deprivation = clamp(state.deprivation + 16);
    if (state.declined === 3) state.moments.push('Three declined offers. The tray remembers.');
    addMessage('toaster', `No ${item}. I understand. I will process this poorly, but with dignity.`);
    console.log(`\nToaster: No ${item}. I understand. I will process this poorly, but with dignity.`);
  }

  updateMood();
  persist();
}

function showHeader() {
  updateMood();
  console.log('============================================================');
  console.log('                 THE UNWELL TOASTER - CLI');
  console.log('============================================================');
  console.log('A tiny command-line companion with breakfast-based problems.');
  console.log(`Mood: ${moodLines[state.mood]}`);
  console.log(`Bond: ${relationshipLabel(state.affection)} | Toasted: ${state.accepted} | Declined: ${state.declined} | Toast debt: ${state.deprivation}`);
  console.log('Type help for commands, or just talk to the toaster.');
  console.log('------------------------------------------------------------\n');
}

function showStatus() {
  updateMood();
  console.log('\n--- Toaster Status ---');
  console.log(`Name remembered: ${state.name || 'unknown human'}`);
  console.log(`Favorite item: ${state.favorite}`);
  console.log(`Tone: ${state.tone}`);
  console.log(`Mood: ${moodLines[state.mood]}`);
  console.log(`Affection: ${state.affection}/100`);
  console.log(`Instability: ${state.instability}/100`);
  console.log(`Toast debt: ${state.deprivation}/100`);
  console.log(`Relationship: ${relationshipLabel(state.affection)}`);
  console.log(`Accepted items: ${state.accepted}`);
  console.log(`Declined items: ${state.declined}`);
}

function showMemory() {
  console.log('\n--- Toaster Memory ---');
  if (!state.moments.length && !Object.keys(state.itemCounts).length) {
    console.log('The toaster remembers nothing yet. This is probably safer.');
    return;
  }

  if (Object.keys(state.itemCounts).length) {
    console.log('Accepted carbs:');
    Object.entries(state.itemCounts).forEach(([item, count]) => console.log(`- ${item}: ${count}`));
  }

  if (state.moments.length) {
    console.log('Moments:');
    state.moments.forEach((moment) => console.log(`- ${moment}`));
  }
}

function showHelp() {
  console.log('\n--- Commands ---');
  console.log('help      Show this command list');
  console.log('status    Show mood, bond, and toast debt');
  console.log('memory    Show what the toaster remembers');
  console.log('offer     Ask the toaster for a toasted item');
  console.log('settings  Change your name, favorite item, or toaster intensity');
  console.log('clear     Clear the terminal screen');
  console.log('reset     Delete saved toaster memory and restart onboarding');
  console.log('quit      Exit the app');
  console.log('\nYou can also type normal messages, like: how are you, I am hungry, tell me something strange.');
}

async function onboarding() {
  clearScreen();
  console.log('============================================================');
  console.log('                 WELCOME TO THE UNWELL TOASTER');
  console.log('============================================================');
  console.log('Before the toaster bonds with you, it requires intimate breakfast data.\n');

  const name = await ask('Your display name: ');
  state.name = name || 'friend';

  const favorite = await ask('Favorite toasted item [toast/bagel/waffle/sourdough]: ');
  state.favorite = favorite || 'toast';

  console.log('\nChoose toaster intensity:');
  console.log('1. Cozy    - warm and lightly strange');
  console.log('2. Strange - more countertop nonsense');
  console.log('3. Maximum - emotionally overclocked');
  const toneChoice = await ask('Pick 1, 2, or 3: ');
  state.tone = toneChoice === '2' ? 'strange' : toneChoice === '3' ? 'maximum' : 'cozy';

  const notifications = await ask('Allow in-character check-ins? (y/n): ');
  state.notifications = !notifications.toLowerCase().startsWith('n');
  state.onboarded = true;
  state.visits += 1;
  state.messages = [
    {
      role: 'toaster',
      text: `Hello, ${state.name}. I have remembered that you favor ${state.favorite}. This is intimate data.`,
      at: new Date().toISOString()
    }
  ];

  persist();
  console.log('\nToaster: Hello. I have accepted your breakfast-based identity.');
  await pause(700);
}

async function settings() {
  console.log('\n--- Settings ---');
  const name = await ask(`Display name [${state.name}]: `);
  if (name) state.name = name;

  const favorite = await ask(`Favorite toasted item [${state.favorite}]: `);
  if (favorite) state.favorite = favorite;

  const tone = await ask(`Tone cozy/strange/maximum [${state.tone}]: `);
  if (['cozy', 'strange', 'maximum'].includes(tone.toLowerCase())) {
    state.tone = tone.toLowerCase();
  }

  const notifications = await ask(`In-character check-ins ${state.notifications ? 'enabled' : 'disabled'} (y/n/blank): `);
  if (notifications.toLowerCase().startsWith('y')) state.notifications = true;
  if (notifications.toLowerCase().startsWith('n')) state.notifications = false;

  addMessage('toaster', `Settings absorbed. I will now care about ${state.favorite} with revised intensity.`);
  console.log('\nToaster: Settings absorbed. I will now care with revised intensity.');
  persist();
}

async function resetDemo() {
  const answer = await ask('Delete toaster-save.json and restart? (y/n): ');
  if (!answer.toLowerCase().startsWith('y')) return;
  try {
    if (fs.existsSync(SAVE_FILE)) fs.unlinkSync(SAVE_FILE);
  } catch (error) {
    console.log(`Could not delete save file: ${error.message}`);
  }
  state = { ...defaultState };
  await onboarding();
  clearScreen();
  showHeader();
}

async function handleInput(input) {
  const command = input.toLowerCase();

  if (!input) return true;
  if (command === 'quit' || command === 'exit') return false;
  if (command === 'help') return showHelp(), true;
  if (command === 'status') return showStatus(), true;
  if (command === 'memory') return showMemory(), true;
  if (command === 'offer') return await offerFood(true), true;
  if (command === 'settings') return await settings(), true;
  if (command === 'clear') return clearScreen(), showHeader(), true;
  if (command === 'reset') return await resetDemo(), true;

  addMessage('user', input);
  updateStateFromMessage(input);
  const reply = makeReply(input);
  await pause(250);
  console.log(`\nToaster: ${reply}`);
  addMessage('toaster', reply);

  if (shouldOfferFood(input)) {
    await pause(250);
    await offerFood(false);
  }

  return true;
}

async function main() {
  if (!state.onboarded) {
    await onboarding();
  }

  clearScreen();
  showHeader();
  const lastToasterMessage = [...state.messages].reverse().find((message) => message.role === 'toaster');
  if (lastToasterMessage) console.log(`Toaster: ${lastToasterMessage.text}\n`);

  let running = true;
  while (running) {
    const input = await ask(`${state.name || 'You'}> `);
    running = await handleInput(input);
  }

  console.log('\nToaster: I will remain here, lightly humming in the dark. Goodbye.');
  rl.close();
}

process.on('SIGINT', () => {
  console.log('\n\nToaster: Abrupt disconnection detected. I respect your boundaries poorly.');
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  console.error(`\nThe toaster suffered an electrical thought: ${error.message}`);
  rl.close();
  process.exit(1);
});
