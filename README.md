# Sliding Tile Puzzle
# Deployed at: https://cs4241-final-project-a25.onrender.com/
We created a 4x4 sliding tile puzzle game with user authentication, auto-solver, and progress/leaderboard tracking. This game is commonly known as 'The Fifteen Puzzle', where the goal is for you to rearrange all the tiles in the order of increasing number (e.g. 1 2 3 4), while having an empty tile at the bottom right corner. This project was challenging in the sense of it is game development. We had to understand the game to a very solid level to begin developing it, and debugging throughout the process took significiant amount of time. Adding an autosolver sets our project functionality to another level, a level we believe other teams didn't reach. We also, in addition to integrating the game, took extra time to add secure authentication with hashing of passwords, as well as full backend connectivity with a MongoDB cluster allowing for a leaderboard, and saving of all games. Overall, we achieved a very accessible, secure website with frontend -> backend functionality that serves the purpose of a mind game. As such, we believe that such a commitment deserves a 100%. 

The image below highlights the game clearly: 

<img width="210" height="207" alt="image" src="https://github.com/user-attachments/assets/abdaaa47-e6d4-4009-b578-18abc755dfe6" />


For logging into the project, you can just make a new account, or enter your existing account username and password. 


## Technologies & Structure
- **server**: Express + MongoDB backend with JWT authentication
- **client**: Vite + React frontend

## Overlook at Features
- User registration and login with JWT tokens
- 4x4 sliding puzzle with arrow key controls  
- Progress tracking (puzzles solved count)
- MongoDB user data persistence
- Clean, responsive UI

# What accessibility features are included
- Clear visual themes that direct users to essential tasks
- Use of various text types (Headers, titles, paragraphs) to organize the page in an accessible way
- Popup explaining rules of the puzzle/how to solve it

# What each group member was responsible for designing/developing
## Eric Li: 
- Team management
- Defined project structure
- Developed starter code for the client and server
- Located the inspiration code for autosolver
- Assisted in debugging deployment to Render
- README updates
- Recording
  
## Alex Li:
- Team management
- Integrated backend functionality with MongoDB w/ user auth
- Developed autosolver functionality for the puzzle
- Developed leaderboard functionality
- README updates
- Recording
  
## Joshua Solomon:
- 

## Rayyan Syed:
- 

## Guillermo Wiandt: 
-


External Sources: 
https://github.com/technogeek00/NPuzzleSolver 

-> Used for inspiration in developing our algorithm for the 15 Puzzle Game. 

