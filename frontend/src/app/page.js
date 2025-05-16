'use client'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'

export default function HomePage() {
    return (
			<html lang='ru'>
				<body>
					<Header />
					<main className='main-landing'>
						<section className='hero'>
							<h1>Школа №52 йоу</h1>
							<p className='subtitle'>
								Добро пожаловать в цифровое пространство вашей школы!
							</p>
						</section>
						<section className='about'>
							<h2>О нашей школе</h2>
							<p>
								<strong>Школа №52 города Санкт-Петербург</strong> — это современное
								образовательное учреждение, где традиции сочетаются с
								инновациями. Мы гордимся нашими учениками, педагогами и
								выпускниками💥💥💥!
							</p>
							<ul>
								<li>
									Более <b>800 миллионов учеников</b> (на самом деле меньше) и{' '}
									<b>52 преподавателя💣💥💥</b>
								</li>
								<li>
									Углублённое изучение математики, информатики,
									английского/немецкого языка👻
								</li>
								<li>
									Современные лаборатории, спортивные и творческие секции🥇
								</li>
								<li>
									Дружелюбная атмосфера, поддержка и развитие каждого ребёнка🚻
								</li>
							</ul>
							<p>В «Империи Зауча» вы можете:</p>
							<ul>
								<li>
									Просматривать успеваемость и аналитику по классам и
									предметам ✅
								</li>
								<li>Управлять списками учеников и учителей ✅</li>
								<li>Следить за школьными новостями и событиями ✅</li>
							</ul>
						</section>
						<section className='cta'>
							<h3>Присоединяйтесь к нашей дружной семье😉!</h3>
							<p>Вместе мы создаём будущее!</p>
						</section>
					</main>
					<Footer />
					<style jsx>{`
						.main-landing {
							min-height: 70vh;
							padding: 0;
							background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
							font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
						}
						.hero {
							text-align: center;
							padding: 3rem 1rem 2rem 1rem;
							background: linear-gradient(90deg, #0070f3 0%, #00c6ff 100%);
							color: #fff;
							border-radius: 0 0 36px 36px;
							box-shadow: 0 4px 24px rgba(0, 112, 243, 0.08);
						}
						.hero h1 {
							font-size: 3rem;
							font-weight: 800;
							letter-spacing: 0.04em;
							margin-bottom: 0.5rem;
							text-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
						}
						.subtitle {
							font-size: 1.35rem;
							font-weight: 500;
							margin-bottom: 0;
							opacity: 0.93;
						}
						.about {
							max-width: 700px;
							margin: 2.5rem auto 2rem auto;
							background: #fff;
							border-radius: 16px;
							box-shadow: 0 2px 16px rgba(0, 112, 243, 0.07);
							padding: 2.2rem 2rem 1.7rem 2rem;
							color: #222;
						}
						.about h2 {
							color: #0070f3;
							font-size: 2rem;
							font-weight: 700;
							margin-bottom: 1rem;
						}
						.about ul {
							margin: 1.2rem 0 1.2rem 1.5rem;
							padding-left: 1.2rem;
							font-size: 1.08rem;
						}
						.about li {
							margin-bottom: 0.5rem;
							line-height: 1.5;
						}
						.about strong {
							color: #0051af;
						}
						.cta {
							text-align: center;
							margin: 2.5rem 0 1.5rem 0;
							padding: 1.5rem 1rem;
							background: linear-gradient(90deg, #00c6ff 0%, #0070f3 100%);
							color: #fff;
							border-radius: 16px;
							box-shadow: 0 2px 12px rgba(0, 112, 243, 0.09);
						}
						.cta h3 {
							font-size: 1.6rem;
							font-weight: 700;
							margin-bottom: 0.5rem;
						}
						.cta p {
							font-size: 1.13rem;
							font-weight: 500;
							margin: 0;
						}
						@media (max-width: 700px) {
							.hero h1 {
								font-size: 2.1rem;
							}
							.about {
								padding: 1.2rem 0.7rem;
							}
							.cta {
								font-size: 1rem;
								padding: 1rem 0.4rem;
							}
						}
					`}</style>
				</body>
			</html>
		)
}
