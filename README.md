# Vocabulary Game for Kids

An interactive vocabulary learning game for kids, built with React, that supports English, Hebrew, and Japanese. The game runs in the browser and is ready for deployment on GitHub Pages.

---

## Features

- **Multi-language Support**: English, Hebrew, and Japanese vocabulary
- **Text-to-Speech**: Built-in speech synthesis for pronunciation
- **Smart Voice Selection**: Automatically selects the best available voice for each language
- **Interactive Learning**: Multiple choice questions with immediate feedback
- **Progress Tracking**: Score tracking and combo system
- **Responsive Design**: Works on desktop and mobile devices
- **Sound Effects**: Audio feedback for correct/incorrect answers

---

## Project Structure

* `public/words-en.csv` - English and Hebrew vocabulary file (CSV format with headers: English,Hebrew)
* `public/words-jp.csv` - Japanese vocabulary file (CSV format with headers: Japanese,English,Hebrew)
* `src/` - React code organized into components
* `src/App.js` - Main application component
* `src/utils/speech.js` - Speech synthesis utilities with smart voice selection

---

## Installation and Local Development

1. Ensure you have Node.js (version 14 or higher recommended) and npm installed.

2. Download or clone the repository:

```bash
git clone https://github.com/LironDev/vocab-game.git
cd vocab-game
```

3. Install dependencies:

```bash
npm install
```

4. Run the project in development mode:

```bash
npm start
```

The website will open at [http://localhost:3000](http://localhost:3000).

---

## Speech Features

The game includes advanced text-to-speech capabilities:

- **Smart Voice Selection**: Automatically finds the best available voice for each language
- **Google Voice Priority**: Prefers Google voices when available, falls back to system voices
- **Cross-platform Support**: Works on desktop browsers and mobile devices (including Android)
- **Configurable Speed**: Speech rate can be adjusted (currently set to 80% of normal speed for better learning)
- **Language Detection**: Automatically selects appropriate voice based on the word's language

### Voice Selection Logic:
1. First tries to find a Google voice for the language
2. If no Google voice is available, selects the first available voice for that language
3. Falls back to English if no voice is found for the target language

---

## Deploying to GitHub Pages

1. Ensure `package.json` includes:

```json
"homepage": "https://LironDev.github.io/vocab-game"
```

2. Install the deployment package:

```bash
npm install --save-dev gh-pages
```

3. Add to `package.json` under "scripts":

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

4. Deploy:

```bash
npm run deploy
```

5. Wait a few minutes for the site to be available at:

[https://LironDev.github.io/vocab-game](https://LironDev.github.io/vocab-game)

---

## Vocabulary Files

### English/Hebrew (words-en.csv)
The file should be in the `public` folder with UTF-8 encoding and headers: `English,Hebrew`

Example:
```csv
English,Hebrew
cat,חתול
dog,כלב
sun,שמש
```

### Japanese (words-jp.csv)
The file should be in the `public` folder with UTF-8 encoding and headers: `Japanese,English,Hebrew`

Example:
```csv
Japanese,English,Hebrew
猫,cat,חתול
犬,dog,כלב
太陽,sun,שמש
```

**Important Notes:**
- Files must be in the `public` folder of the project
- Use UTF-8 encoding to support Hebrew and Japanese characters
- Column headers must match exactly: `English,Hebrew` for words-en.csv and `Japanese,English,Hebrew` for words-jp.csv
- The code loads files using: `fetch(\`${process.env.PUBLIC_URL}/words-en.csv\`)` for English and `fetch(\`${process.env.PUBLIC_URL}/words-jp.csv\`)` for Japanese

---

## Core Technologies

* **React** (with Hooks)
* **PapaParse** for CSV file parsing
* **Web Speech API** for text-to-speech functionality
* **GitHub Pages** for deployment
* **Modern CSS** with responsive design

---

## How to Play

1. **First Time Setup**: Enter your name and gender (choose between "boy" or "girl")
2. **Language Selection**: Choose between English, Hebrew, or Japanese vocabulary
3. **Gameplay**: The app displays words with three multiple-choice options
4. **Answering**: Click on the correct answer
5. **Feedback**: Get audio feedback and encouraging messages
6. **Progress**: Track your score and combo streaks
7. **Controls**: You can finish or restart at any time

---

## Speech Controls

- **Toggle Sound**: Click the speaker icon to enable/disable speech
- **Automatic Play**: Speech automatically plays when viewing words (if enabled)
- **Voice Quality**: The app automatically selects the best available voice for each language
- **Speed Control**: Speech is set to 80% of normal speed for better learning

---

## Browser Compatibility

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Speech Support**: All modern browsers with Web Speech API support

---

## Important Links

* Project Repository: [https://github.com/LironDev/vocab-game](https://github.com/LironDev/vocab-game)
* GitHub Pages Site: [https://LironDev.github.io/vocab-game](https://LironDev.github.io/vocab-game)

---

## Support

If you encounter issues or have questions, you can:
- Open an Issue in the repository
- Contact me directly

---

## License

MIT License

---

Have fun learning! 🎉
