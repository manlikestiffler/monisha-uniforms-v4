
# Monisha Uniforms - E-Commerce Platform

This is a modern, full-stack e-commerce platform for Monisha Uniforms, designed to provide a seamless and engaging shopping experience for school uniforms. The application is built with a React-based frontend and leverages Firebase for backend services, including authentication, database, and storage.

## Key Features

- **User Authentication:** Secure user registration and login with email verification and password reset functionality.
- **Product Catalog:** Browse a comprehensive catalog of school uniforms, with detailed product pages, image galleries, and stock availability.
- **Real-time Updates:** The home page features real-time updates for recent and top-rated products using Firebase's real-time listeners.
- **Product Discovery:**
  - **Collections Page:** View all available uniforms, sorted by the most recent additions.
  - **Search:** Search for products by name or school.
- **Shopping Cart:** A persistent shopping cart that syncs across devices for authenticated users and uses local storage for guests.
- **Wishlist:** Save favorite items for later with a persistent wishlist for authenticated users.
- **Responsive Design:** A fully responsive and mobile-first design ensures a seamless experience across all devices.

## Tech Stack

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool that provides a quicker and leaner development experience for modern web projects.
- **React Router:** For declarative routing in the React application.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Framer Motion:** For animations and gestures.
- **Lucide React:** A library of beautiful and consistent icons.

- **React:** Chosen for its component-based architecture, which allows for the creation of reusable UI elements and simplifies state management. Its virtual DOM ensures efficient updates and high performance.
- **Vite:** Selected for its lightning-fast Hot Module Replacement (HMR) and optimized build process, which significantly speeds up development and improves the developer experience.
- **React Router:** The standard for routing in React applications, enabling declarative and dynamic routing that is essential for a multi-page e-commerce site.
- **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development without writing custom CSS. It's highly customizable and helps maintain a consistent design system.
- **Framer Motion:** Used to create fluid and engaging animations, improving the user experience and making the interface feel more interactive.
- **Lucide React:** Provides a lightweight and customizable icon set that enhances the UI's visual appeal and usability.

### Backend & Services

- **Firebase:** A comprehensive backend-as-a-service (BaaS) platform that provides a suite of tools to build, release, and monitor web applications. We chose Firebase to accelerate development by leveraging its managed services.
  - **Authentication:** Simplifies the implementation of secure user authentication, including social logins and password resets, saving significant development time.
  - **Firestore:** A flexible, scalable NoSQL database with real-time capabilities, perfect for an e-commerce application where live data updates are crucial.
  - **Storage:** Provides a simple and secure way to store and manage user-generated content like product images.
- **JSON Server:** Used during the initial development phase to mock a REST API, allowing for frontend development to proceed without a live backend.

## Project Structure

The project follows a standard React application structure, with a clear separation of concerns:

- **`src/components`**: Contains reusable UI components used throughout the application.
- **`src/pages`**: Each file in this directory represents a route in the application.
- **`src/contexts`**: Holds the context providers for managing global state (e.g., `AuthContext`, `CartContext`).
- **`src/services`**:
  - **`firebase.js`**: Initializes and configures the Firebase app and exposes all Firebase-related functions.
  - **`api.js`**: Acts as an abstraction layer between the UI components and the Firebase service, transforming data as needed.
- **`public`**: Contains static assets like images and icons.

## Component & Page Architecture

The application's architecture is designed to be modular and scalable, with a clear separation between pages and reusable components.

- **Pages (`src/pages`)**: Each file in this directory corresponds to a specific route. Pages are responsible for fetching the data they need and composing the UI by assembling various components. For example, the `Collections.jsx` page fetches all products and passes them to the `ProductGrid.jsx` component for rendering.

- **Components (`src/components`)**: These are the building blocks of the UI. They are designed to be reusable and are often composed together to create more complex UI structures.
  - **Data Flow**: Components receive data and callbacks as props from their parent pages. For example, `ProductCard.jsx` receives a `product` object and displays its details.
  - **State Management**: Local component state is managed with React's `useState` hook, while global state (like the authenticated user and shopping cart) is managed with `AuthContext` and `CartContext`.

### Example Flow: Displaying Recent Products

1. The **`Home.jsx`** page renders the **`RecentProducts.jsx`** component.
2. **`RecentProducts.jsx`** calls the `api.getRecentProducts()` function to fetch the three most recent uniforms.
3. The **`api.js`** module then calls `firebaseService.getRecentUniforms()`, which queries the Firestore database.
4. Once the data is returned, **`RecentProducts.jsx`** maps over the products and renders a **`ProductCard.jsx`** for each one, passing the product data as props.
5. The **`ProductCard.jsx`** component then displays the product's name, price, and image, and handles user interactions like adding to the cart or wishlist.

## Performance Metrics & Optimizations

- **Real-time Listeners:** The application uses Firebase's `onSnapshot` for real-time updates on the home page, ensuring that users see the latest products without needing to refresh the page.
- **Code-Splitting:** By leveraging Vite's automatic code-splitting, the application only loads the necessary JavaScript for the current route, improving initial load times.
- **Image Optimization:** Placeholder images are used to prevent layout shifts while the main product images are loading.
- **Database Indexing:** Firestore queries are optimized with appropriate indexes to ensure fast data retrieval, especially for sorting and filtering.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/monisha-uniforms-v4.git
   cd monisha-uniforms-v3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase:**
   - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password provider), **Firestore**, and **Storage**.
   - In your Firebase project settings, add a new web app and copy the `firebaseConfig` object.
   - Replace the placeholder configuration in `src/services/firebase.js` with your own project's configuration.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5174`.

### Available Scripts

- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally for previewing.
- **`npm run json-server`**: Starts the JSON server with the mock database (if needed).

## Future Enhancements

- **Admin Dashboard:** A dedicated interface for managing products, schools, and orders.
- **Order Management:** A complete checkout and order management system for users.
- **Payment Gateway Integration:** Integration with a payment provider like Stripe or PayPal.
- **Advanced Search & Filtering:** More advanced filtering options on the collections page (e.g., by price, size, gender).
- **Automated Testing:** Implementation of unit and end-to-end tests to ensure application stability. 