
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Login from './Components/Login/Login';
import User from './Components/User/User';
import ProtectedRoute from "./Components/Helper/ProtectedRoute";
import { UserStorageProvider } from './UserContext';
import './App.css';
import NotFound from './Components/NotFound';

function App() {
	return (
		<div className='App' >
			<BrowserRouter>
				<UserStorageProvider>
					<Header/>
					<main className='AppBody'>
						<Routes>
						<Route path="/" element={<Home/>} />
						<Route path="login/*" element={<Login/>} />
						<Route path="conta/*" element={<ProtectedRoute> <User /> </ProtectedRoute>} />
						<Route path="*" element={<NotFound/>} />
						</Routes>
					</main>
					<Footer/>
				</UserStorageProvider>
			</BrowserRouter>
		</div>
	);
}

export default App;
