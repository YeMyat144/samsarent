# Samsarental

Samsarental is a platform where users can list their items for others to borrow and request to borrow items from other users. The application handles the entire borrowing lifecycle, from listing items to approving borrow requests and managing the borrowing process.

![Samarental Demo](https://i.ibb.co/twQrbTqP/demo.png)

## Features

- **User Authentication**: Sign up and login functionality
- **Item Management**: Add, view, and delete items
- **Borrowing System**: Request to borrow items, approve/reject requests
- **Delivery Coordination**: Lenders can specify delivery details when approving requests
- **Notifications**: Users are notified of request status changes
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Offline Detection**: Alerts users when they lose internet connection

## Technologies Used

- **Frontend**: Next.js, Material UI
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **Styling**: Material UI theming system

## Setup

1. Clone the repository
2. Install dependencies
3. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
4. Enable Authentication (Email/Password) and Firestore in your Firebase project
5. Create a `.env.local` file in the root directory with your Firebase configuration
6. Run the development server


## Usage

1. **Sign Up/Login**: Create an account or login to access the marketplace
2. **Browse Items**: View items available for borrowing
3. **Add Items**: List your own items for others to borrow
4. **Request Items**: Send borrow requests for items you want to use
5. **Manage Requests**: Approve or reject incoming borrow requests
6. **Specify Delivery**: When approving, provide delivery details
7. **View Requests**: Track the status of your incoming and outgoing requests




