import Header from '../components/Header'
import Footer from '../components/Footer'

export default function HomePage() {
	return (
		<html lang='ru'>
			<body>
				<Header />
				<main style={{ minHeight: '70vh', padding: '10px' }}>
					<div>
						<h1>Главная страница</h1>
						<p>Добро пожаловать в «Империю зауча»!</p>
					</div>
				</main>
				<Footer />
			</body>
		</html>
	)
}
