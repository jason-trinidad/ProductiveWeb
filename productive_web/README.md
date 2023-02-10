# "Productive"

Please contact me at jatrinidad@alumni.stanford.edu if you'd like a link to a live demo!

## Description

"Productive" (temporary name) will one day be the ultimate productivity app! Eventually, Productive will allow users to work in teams to support each other in their task planning and completion.

Currently, Productive allows a user to populate a nested to-do list, drag-and-drop tasks to schedule them on a calendar, and have tasks repeat on the calendar if so desired. Users have the option to sign in with Google to save their tasks. Signed-in users may also request a "team-up" with another user. This feature counts the times a repeating task has been completed, adding these completions to a total score between the two users.

## Sample workflow

* Start by "dumping" your to-do items into the "List" section. You can change "tree" levels using Tab and Shift + Tab. (Don't worry too much about categories, we can sort those out later.)

<img width="1432" alt="Screen Shot 2023-02-09 at 3 08 56 PM" src="https://user-images.githubusercontent.com/11757224/217950540-c1e96506-e553-4e41-8a63-aed1ab7b3242.png">

* Create new tasks to serve as categories, and drag and drop your tasks to sort them:

<img width="1432" alt="Screen Shot 2023-02-09 at 3 13 41 PM" src="https://user-images.githubusercontent.com/11757224/217951360-170edf14-f8df-43b2-8885-2a54ed38bfa5.png">

* Schedule your tasks by dragging and dropping to the desired time on the calendar. Use the time readout to drop on the intended time.

<img width="1432" alt="Screen Shot 2023-02-09 at 3 18 13 PM" src="https://user-images.githubusercontent.com/11757224/217952061-e4adaafa-3a57-4b86-99cf-9f9dfd17c325.png">

* Manage repeats for a task by clicking on the task in the calendar:

<img width="1432" alt="Screen Shot 2023-02-09 at 3 22 09 PM" src="https://user-images.githubusercontent.com/11757224/217952731-f500df4c-cf77-46b2-8e56-6d800f247f45.png">

* Sign-in using a Google account to save your new plan:

<img width="1438" alt="Screen Shot 2023-02-09 at 3 25 42 PM" src="https://user-images.githubusercontent.com/11757224/217953237-60470704-56fe-4a7e-a77a-f492961ed69f.png">

* Invite a friend to team-up. Type your friend's email address, hit enter, and your email address will appear as an option for a team-up on their events:

<img width="445" alt="Screen Shot 2023-02-09 at 3 30 25 PM" src="https://user-images.githubusercontent.com/11757224/217953949-4d0073a0-66f7-45d2-864e-5d42594d5008.png">

## Future improvements
Making the app easier to develop is a top priority now that an MVP has been created and usefulness has been demonstrated (at least to this user!).

In the near future, I hope to:
1. Add a testing framework (e.g. Jest) and tests to speed up testing of changes and new features
2. Standardize CSS across the app. CSS has proven to be one of the biggest challenges for this project. I would like experiment and find a preferred approach going forward
3. Change the way task order is stored to a linked-list model. This should dramatically improve the current I/O performance. This change will also necessitate changing the implementation of repeating calendar tasks, and implementing lazy loading of the task list (to compensate for losing the ability to sort the task list on the server via a query).
