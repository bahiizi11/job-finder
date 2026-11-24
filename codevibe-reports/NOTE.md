# A note about my CodeVibe report

I want to be upfront about something before you look at my CodeVibe report.

I typed every line of this project myself.
I didn't use Copilot, ChatGPT or any other AI tool to write code, and I didn't paste code in.
Even so, my assignment report shows about **70% AI authorship**, well over the 20% limit.
When I first saw that number, I was honestly confused and worried,
so I exported my CodeVibe data but not the one for submission and dug into it to understand what was going on.

## What I found

CodeVibe counts my **corrections** as AI. While building the app I made plenty of typos (for example `htpps` instead of `https`, `dotenv` spelled wrong, missing brackets in my JavaScript) and fixed them with Backspace, like any developer would. CodeVibe records every Backspace press as a full "line", and the assignment score puts those lines in the AI column. So the more mistakes I fixed, the higher my "AI" percentage went.

Some things that show this:

- My daily dashboard card shows **0% AI / 100% manual** for the same work.
- The only file I never had to correct, `requirements.txt`, shows **0% AI**. Every file I corrected shows a high percentage.
- Fixing typos made the number go up, while typing new code made it go down slightly.

## Why my ownership score never changed

My ownership score stayed at 0/100 the whole time, even though I opened, read and edited all my files. CodeVibe lists my files as needing review because it counts my typo fixes as AI, but its review tracker only starts after a real AI event. Since my project has none, no review was ever recorded, so the score could never move from 0.

## Please check it yourself

The full list of events is inside the CodeVibe report in this folder. If you look at it, you will find:

- **0 events with source "ai"**
- **0 paste events** (no `large-paste` or AI-insertion events at all)

All of the "flagged AI" lines come from `manual-deletion` (Backspace), `editor-undo-redo` (typo fixes) and `editor-assisted-change` (VS Code auto-closing HTML tags).

I reported this to the CodeVibe developer here: https://github.com/waka-man/codevibe/issues/39
