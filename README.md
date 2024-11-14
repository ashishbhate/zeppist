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


## Caveats
1. The app isn't very polished, or user friendly. It's good enough for me.
2. The app only shows notifications for tasks with due dates at the time the task
is due
3. You cannot mark the task as done, or update the task in anyway.
4. The code is pretty simple, but a bit hackish to work around a few issues with
the Zepp OS libraries
5. I've tested to work on my Amazfit Active Edge, which is a round device. I have
not tested this to work on any square device. Getting the simulator running properly
is a bit difficult.
