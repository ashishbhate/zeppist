# Zeppist
Sync today's tasks from Todoist to a ZeppOS watch, and show a notification at
the task's due date

## Why
I prefer not to keep my watch sync'd to the phone all day. I don't like notifications
on my watch either. With this app, I'm able to sync today's tasks from Todoist
to the watch and get notifications without having to keep the watch connected to
my phone.

## How
1. Set-up your dev environment as described here https://docs.zepp.com/docs/guides/quick-start/
2. Add your Todoist API key to the app.js file
3. Run `zepp preview`

## UI
- The top section shows when tasks were last sync'd
- The middle section shows the task list
- At the bottom is the button to sync today's tasks

## Caveats
1. The app isn't very polished, or user friendly. It's good enough for me.
2. The device needs to be connected to the phone to fetch tasks
3. The app only shows notifications for tasks with due dates at the time the task
is due
4. You cannot mark the task as done, or update the task in anyway.
5. The code is pretty simple, but a bit hackish to work around a few issues with
the Zepp OS libraries
6. I've tested to work on my Amazfit Active Edge, which is a round device. I have
not tested this to work on any square device. Getting the simulator to run properly
is a bit difficult.

