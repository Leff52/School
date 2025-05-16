'use client'

export default function Footer() {
	return (
		<footer className='footer'>
			<div className='footer-container'>
				<div className='footer-content'>
					<div className='footer-section'>
						<h3>Империя Зауча</h3>
						<p>Образовательная платформа</p>
					</div>
					<div className='footer-section'>
						<h3>Полезные ссылки</h3>
						<ul className='footer-links'>
							<li>
								<a href='/courses'>Курсы</a>
							</li>
							<li>
								<a href='/about'>О нас</a>
							</li>
						</ul>
					</div>
					<div className='footer-section'>
						<h3>Связаться со мной</h3>
						<p>rabpochtaPOMOGITE@mail.ru</p>
						<p>+7 (911) 937-50-17</p>
					</div>
				</div>

				<div className='footer-bottom'>
					<p>© 2025 Империя зауча. Все права защищены, наверное).</p>
					<div className='social-links'>
						<a
							href='https://github.com/Leff52'
							target='_blank'
							rel='noopener noreferrer'
							className='social-link'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.2-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 6.7 18 7 18 7c.7 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z' />
							</svg>
						</a>
						<a
							href='https://t.me/levkaflower'
							target='_blank'
							rel='noopener noreferrer'
							className='social-link'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.9 8.2l-1.5 7.4c-.1.6-.5.7-1 .5l-2.7-2-1.3 1.3c-.1.1-.3.3-.6.3l.2-2.8 5-4.5c.2-.2 0-.3-.3-.1l-6.2 3.9-2.7-.9c-.5-.1-.5-.5.1-.8l10.5-4c.5-.2.9.1.7.7z' />
							</svg>
						</a>
					</div>
				</div>
			</div>

			<style jsx>{`
				.footer {
					background: #f8f9fa;
					padding: 50px 0 20px;
					color: #333;
				}

				.footer-container {
					max-width: 1200px;
					margin: 0 auto;
					padding: 0 20px;
				}

				.footer-content {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 30px;
					margin-bottom: 40px;
				}

				.footer-section h3 {
					margin-top: 0;
					margin-bottom: 15px;
					font-size: 1.2rem;
					color: #0070f3;
				}

				.footer-links {
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.footer-links li {
					margin-bottom: 8px;
				}

				.footer-links a {
					color: #555;
					text-decoration: none;
					transition: color 0.3s;
				}

				.footer-links a:hover {
					color: #0070f3;
				}

				.footer-bottom {
					padding-top: 20px;
					border-top: 1px solid #e0e0e0;
					display: flex;
					justify-content: space-between;
					align-items: center;
					flex-wrap: wrap;
					gap: 20px;
				}

				.social-links {
					display: flex;
					gap: 15px;
				}

				.social-link {
					color: #555;
					transition: color 0.3s;
				}

				.social-link:hover {
					color: #0070f3;
				}
			`}</style>
		</footer>
	)
}
