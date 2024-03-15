# banking-app

#### Video Demo: <https://www.youtube.com/watch?v=VZMrfDDFs3U>

#### Description:

This is my banking app that I developed. I got the idea after following a previous course on JavaScript which created a simple banking app in vanilla JS.

I decided to extend this project to make it more advanced by using SQLite in the backend to manage and store data in a database.

I then decided that I would use Flask to implement the backend, which I had a lot of fun using and gained some great experience using the fetch() function in JavaScript to pass and receive data from the back-end to the front-end and vice versa.

## LAYOUT

To design and implement the layout of my project, I decided to use Jinja. I created layout.html with the common attributes for each page, although later I realized that I also wanted to change parts of this for different scenarios such as if the user is logged in or not. To achieve this, I created separate HTML files and with the use of Jinja if statements and passing data from Flask to the front-end, I could display the correct navigation.

I then decided to include the script tags for each page at the end of their individual pages with a separate script page for each page and 1 extra for my messageHandler which I share between the register.js and login.js.

## REGISTER

To begin with, I started by creating the register page. I implemented this using the HTML form and using "POST" along with the fetch function. I wanted to have a password/confirmation that I could check in the backend.

I also decided as a design choice that when the user signed up by entering their username and password, I would then have a separate form pop up asking how much the user would like to deposit.

I then would check the details in the SQL database and make sure there was not any other user with the same username and if not add their account to the database.

### password validation

I also implemented a password validation that would check that the users password is over 3 letters long and stored it in a separate file accessible to my flask app, this way it is easily identifiable and accessible if I wanted to add more security in the future.

## SQL

I designed my SQL database using 3 tables: one to store the users, one to store the balance, and finally one to keep track of the transactions (by withdrawals and deposits) so that I could display them on the landing page. These were all connected by the "user id".

I then, when I signed up a user, would enter their details into the database and hash their password using "generate_password_hash" from the "werkzeug.security" library. I would enter a "deposit" also into the transactions of the amount they deposited it so when they enter the landing page it would be displayed in their transactions.

## LOGIN

I next moved on to the login section, I implemented this using an HTML form, Flask in the backend, and .fetch(). I would use the fetch to send the data to the backend and validate the password and username. I would use the "werkzeug.security" to check the password and make sure everything was fine. I would also check the username and if everything was okay, I would return a response.ok to the fetch(). If it was not all okay, I would return false and fetch() would trigger a message with the correct error message such as "incorrect password."

## LANDING PAGE

### transfer

If the user successfully registers and logs in, they will end up on the landing page. The first thing I added was their name at the top in the navigation such as "Welcome, Peter." To get their name, I stored it in a session['username'] = 'peter' for example and could then access it using Jinja.

The next thing I added was the logout ability so that the user could log out; this was done through the backend.

Next, I implemented the transfer functionality, where one user could transfer money to another registered user as long as they have enough money in their account. To do this, I once again used a combination of fetch and Flask, where fetch would send the data to the backend and make sure the user they are trying to send the money to exists and if they have enough money to transfer. If so, I would deduct the money from the user's balance and add a 'withdrawal' in their transactions. I then would add the same amount to the recipient's balance and record a 'deposit' in the transactions.

I also made a design decision at this point to add a spinner that appears when the user sends money set for 1 second; this gives the impression that the bank is making a decision, and depending on what happens in the backend, the user will receive either a success or failure message (along with the reason why).

Once the user has successfully transferred the money and clicked the confirm button from the confirmation button, this will trigger the UI to update, deducting the appropriate amount from their balance as well as adding the transaction to their movements.

### loan

Next, I implemented the loan functionality, which would allow the user to borrow up to 41% of their current balance. To do this, they would input an amount and using Flask and fetch(), I would check to see how much money the user has in their account and see if the amount the user wants to borrow is less than 41% of if. If it

is, they will get a confirmation along with a 1-second loading spinner, and the UI would then update to show this, and if not, they would receive a failure message.

### close account

Next, I implemented the close account feature; this feature allows the user to close their account. To do so, they need to enter their username and password. I then used a fetch request along with Flask to delete the user from the SQL database and send a confirmation message and redirect the user back to the login page.

### logoff timer

At the bottom, I have a logoff timer which I had a bit of trouble with as it would slightly move as it counted down. To prevent this, I changed the font to a 'monospace' font, and this prevented that from happening.

### refactor

After I had finished the app, and it was all working, I made the decision to refactor my JavaScript code to use ES6 classes. Not only did it make my code more readable, but it also allowed me to use modules so that I could share functionality between them such as my messageHandler.

## FUTURE FEATURES

In the future, there are some features I would like to add such as 2-factor authentication, create my own password hash library, I also want to make the user re-enter the password when they send money to another user, and also allow the user to filter the movements by the month or year.

I may also add controller for the js code to make it easier to see what is going on.
