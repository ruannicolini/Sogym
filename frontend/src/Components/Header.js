import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../UserContext';

import styles from './Header.module.css';

const Header = () => {
	const { data } = useContext(UserContext);
	return (
		<header className={styles.header}>
			<nav className={`${styles.nav} container`} >
				<Link to="/" className={styles.logo} aria-label='Motivaçao - Home'>
					<span className={styles.academia}>Academia </span><span className={styles.motivacao}>Motivação</span>
				</Link>
				{data ? (<Link to="/conta" className={styles.login}>{data.nome}</Link>) : (<Link to="/login" className={styles.login}>Login / Criar</Link>)}
			</nav>	
		</header>
	);
}

export default Header;