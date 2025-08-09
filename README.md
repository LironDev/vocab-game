# Vocabulary Game for Kids

משחק לימוד מילים באנגלית ובעברית לילדים, מבוסס React, רץ על הדפדפן בלבד, ומוכן לפריסה ב-GitHub Pages.

---

## תכולת הפרויקט

* public/words.csv - קובץ המילים באנגלית ובעברית (פורמט CSV עם כותרת: English,Hebrew)
* src/ - קוד React מחולק לרכיבים (Components)
* src/App.js - רכיב ראשי של האפליקציה

---

## התקנה והרצה מקומית

1. וודא שיש לך Node.js (גרסה 14 ומעלה מומלצת) ו־npm מותקן.

2. הורד או שכפל את הריפו:

git clone [https://github.com/LironDev/vocab-game.git](https://github.com/LironDev/vocab-game.git)
cd vocab-game

3. התקן תלות:

npm install

4. הפעל את הפרויקט בסביבת פיתוח:

npm start

האתר יפתח בכתובת [http://localhost:3000](http://localhost:3000).

---

## פריסת האתר ב-GitHub Pages

1. ודא ש־package.json כולל את השורה:

"homepage": "[https://LironDev.github.io/vocab-game](https://LironDev.github.io/vocab-game)"

2. התקן את חבילת הפריסה:

npm install --save-dev gh-pages

3. הוסף ל־package.json תחת "scripts":

"predeploy": "npm run build",
"deploy": "gh-pages -d build"

4. בצע פריסה:

npm run deploy

5. המתן מספר דקות שהאתר יתפרס ויהיה זמין בכתובת:

[https://LironDev.github.io/vocab-game](https://LironDev.github.io/vocab-game)

---

## הערות חשובות לגבי טעינת הקובץ words.csv

* הקובץ words.csv צריך להיות בתיקיית public בפרויקט, כלומר בנתיב: public/words.csv

* ב־React, כדי לטעון את הקובץ הזה יש להשתמש בכתובת יחסית נכונה, בהתאם ל־homepage שהוגדר. הקוד טוען את הקובץ כך: fetch(`${process.env.PUBLIC_URL}/words.csv`)

* ודא שפורמט הקובץ תקין (UTF-8), ושכותרות העמודות הן בדיוק: English,Hebrew

* דוגמה לקטע של הקובץ:

English,Hebrew
cat,חתול
dog,כלב
sun,שמש

---

## טכנולוגיות מרכזיות

* React (עם Hooks)
* PapaParse לניתוח קבצי CSV
* Web Speech API להקראת מילים באנגלית
* GitHub Pages לפריסת האתר
* CSS מודרני ועיצוב רספונסיבי

---

## איך לשחק?

* בפעם הראשונה יש להזין שם ומגדר (בחירה בין "boy" ל-"girl").
* האפליקציה מציגה מילים באנגלית או בעברית עם שלוש אפשרויות בחירה.
* יש ללחוץ על התשובה הנכונה.
* תקבלו חיזוקים קוליים ומילים מעודדות.
* אפשר לסיים או להתחיל מחדש בכל זמן.

---

## קישורים חשובים

* ריפו הפרויקט ב־GitHub: [https://github.com/LironDev/vocab-game](https://github.com/LironDev/vocab-game)
* דף GitHub Pages: [https://LironDev.github.io/vocab-game](https://LironDev.github.io/vocab-game)

---

## תמיכה

אם יש בעיות או שאלות, ניתן לפתוח Issue בריפו או לפנות אליי ישירות.

---

## רישיון

MIT License

---

בהצלחה ושתהנה מהמשחק! 🎉
