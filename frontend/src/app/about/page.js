'use client'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function About(){
    return (
			<div className='about-page'>
				<Header />

				<main className='main-content'>
					<div className='container'>
						<h1 className='page-title'>О нашей школе</h1>

						<section className='section intro-section'>
							<h2>Образование для будущего</h2>
							<p>
								Школа №52 — это современное образовательное учреждение,
								созданное для раскрытия потенциала каждого ученика. Мы сочетаем
								традиционные методики и инновационные подходы, обеспечивая
								высокое качество образования и всестороннее развитие личности.
							</p>

							<div className='stats-container'>
								<div className='stat-item'>
									<span className='stat-number'>101%</span>
									<span className='stat-desc'>
										выпускников поступают в вузы
									</span>
								</div>
								<div className='stat-item'>
									<span className='stat-number'>52+</span>
									<span className='stat-desc'>лет успешной работы</span>
								</div>
								<div className='stat-item'>
									<span className='stat-number'>89</span>
									<span className='stat-desc'>средний балл ЕГЭ</span>
								</div>
							</div>
						</section>

						<section className='section'>
							<h2>Наш подход к обучению</h2>
							<p>
								Мы создаем образовательную среду, в которой ученики не только
								получают знания, но и учатся мыслить критически, работать в
								команде и решать комплексные задачи. Наша методика базируется на
								индивидуальном подходе к каждому ребенку, что позволяет
								развивать его уникальные способности и таланты.
							</p>

							<div className='features-grid'>
								<div className='feature'>
									<h3>Персонализированное обучение</h3>
									<p>
										Индивидуальные траектории обучения и развития для каждого
										ученика с учетом его способностей и интересов.
									</p>
								</div>
								<div className='feature'>
									<h3>Современные технологии</h3>
									<p>
										Использование цифровых образовательных платформ и
										мультимедийных ресурсов для эффективного усвоения материала.
									</p>
								</div>
								<div className='feature'>
									<h3>Практико-ориентированный подход</h3>
									<p>
										Связь теории с практикой через проектную деятельность,
										лабораторные работы и реальные кейсы.
									</p>
								</div>
								<div className='feature'>
									<h3>Развитие Soft Skills</h3>
									<p>
										Особое внимание уделяем развитию коммуникативных навыков,
										эмоционального интеллекта и лидерских качеств.
									</p>
								</div>
							</div>
						</section>

						<section className='section ege-section'>
							<h2>Высокие результаты ЕГЭ</h2>
							<p>
								Наши выпускники стабильно показывают высокие результаты на
								Едином государственном экзамене. За последние 5 лет более 30%
								наших учеников набрали более 90 баллов по профильным предметам.
							</p>

							<div className='ege-stats'>
								<div className='ege-subject'>
									<h3>Русский язык</h3>
									<div className='progress-bar'>
										<div className='progress' style={{ width: '89%' }}>
											89
										</div>
									</div>
									<p>Средний балл 2024 года</p>
								</div>
								<div className='ege-subject'>
									<h3>Математика (профиль)</h3>
									<div className='progress-bar'>
										<div className='progress' style={{ width: '89%' }}>
											89
										</div>
									</div>
									<p>Средний балл 2024 года</p>
								</div>
								<div className='ege-subject'>
									<h3>Физика</h3>
									<div className='progress-bar'>
										<div className='progress' style={{ width: '89%' }}>
											89
										</div>
									</div>
									<p>Средний балл 2024 года</p>
								</div>
								<div className='ege-subject'>
									<h3>Информатика</h3>
									<div className='progress-bar'>
										<div className='progress' style={{ width: '100%' }}>
											101
										</div>
									</div>
									<p>Средний балл 2024 года</p>
								</div>
							</div>

							<div className='achievements'>
								<h3>Достижения наших выпускников:</h3>
								<ul>
									<li>8 стобалльников за последние 3 года</li>
									<li>5 победителей всероссийских олимпиад</li>
									<li>
										Ежегодно более 75% выпускников поступают в ведущие вузы
										страны
									</li>
									<li>
										12 учеников получили гранты на обучение в престижных
										зарубежных университетах
									</li>
								</ul>
							</div>
						</section>

						<section className='section teachers-section'>
							<h2>Наши преподаватели</h2>
							<p>
								Основа успеха нашей школы — высококвалифицированный
								педагогический коллектив. У нас работают опытные учителя, среди
								которых кандидаты наук, заслуженные учителя РФ, победители
								профессиональных конкурсов.
							</p>

							<h3>Рекомендации по выбору предметов и учителей:</h3>

							<div className='teachers-recommendations'>
								<div className='recommendation'>
									<h4>Для будущих инженеров и технических специалистов</h4>
									<p>
										<strong>Ключевые предметы:</strong> математика, физика,
										информатика
									</p>
									<p>
										<strong>Рекомендуемые учителя:</strong> НЕТ
									</p>
									<p>
										Эти преподаватели имеют богатый опыт подготовки к
										техническим вузам и проводят дополнительные занятия по
										олимпиадной математике и физике.
									</p>
								</div>

								<div className='recommendation'>
									<h4>Для будущих медиков и биологов</h4>
									<p>
										<strong>Ключевые предметы:</strong> биология, химия, русский
										язык
									</p>
									<p>
										<strong>Рекомендуемые учителя:</strong> НЕТ
									</p>
									<p>
										Программа включает углубленное изучение органической химии и
										анатомии, регулярные лабораторные практикумы.
									</p>
								</div>

								<div className='recommendation'>
									<h4>Для гуманитариев</h4>
									<p>
										<strong>Ключевые предметы:</strong> русский язык,
										литература, история, обществознание, иностранные языки
									</p>
									<p>
										<strong>Рекомендуемые учителя:</strong> Тем более нет
									</p>
									<p>
										Наши гуманитарные классы регулярно участвуют в дебатах,
										творческих конкурсах и исследовательских проектах.
									</p>
								</div>
							</div>
						</section>

						<section className='section programs-section'>
							<h2>Образовательные программы</h2>
							<p>
								Наша школа предлагает широкий спектр основных и дополнительных
								образовательных программ:
							</p>

							<div className='programs-grid'>
								<div className='program'>
									<h3>Начальная школа (1-4 классы)</h3>
									<p>
										Формирование базовых знаний и навыков, развитие
										познавательной активности и творческого мышления.
									</p>
								</div>
								<div className='program'>
									<h3>Основная школа (5-9 классы)</h3>
									<p>
										Углубленное изучение отдельных предметов, профориентация,
										подготовка к ОГЭ.
									</p>
								</div>
								<div className='program'>
									<h3>Старшая школа (10-11 классы)</h3>
									<p>
										Профильное обучение, целенаправленная подготовка к ЕГЭ и
										поступлению в вузы.
									</p>
								</div>
								<div className='program'>
									<h3>Дополнительное образование</h3>
									<p>
										Более 20 кружков и секций, охватывающих все сферы интересов
										учащихся: от робототехники до театральной студии.
									</p>
								</div>
							</div>
						</section>
					</div>
				</main>

				<Footer />

				<style jsx>{`
					.about-page {
						min-height: 100vh;
						display: flex;
						flex-direction: column;
						background-color: #f5f7fa;
					}

					.main-content {
						flex: 1;
						padding: 2rem 0;
					}

					.container {
						max-width: 1140px;
						margin: 0 auto;
						padding: 0 20px;
					}

					.page-title {
						text-align: center;
						color: #0070f3;
						font-size: 2.5rem;
						margin-bottom: 2rem;
						font-weight: 700;
					}

					.section {
						background-color: white;
						border-radius: 10px;
						box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
						padding: 2rem;
						margin-bottom: 2.5rem;
					}

					.section h2 {
						color: #0070f3;
						font-size: 1.8rem;
						margin-top: 0;
						margin-bottom: 1.5rem;
						padding-bottom: 0.7rem;
						border-bottom: 1px solid #e0e0e0;
					}

					.section h3 {
						color: #333;
						font-size: 1.4rem;
						margin-top: 1.5rem;
						margin-bottom: 1rem;
					}

					.section p {
						color: #444;
						font-size: 1.1rem;
						line-height: 1.6;
						margin-bottom: 1rem;
					}
					.stats-container {
						display: flex;
						justify-content: space-around;
						flex-wrap: wrap;
						margin: 2.5rem 0;
					}

					.stat-item {
						text-align: center;
						padding: 1.5rem;
						min-width: 180px;
					}

					.stat-number {
						display: block;
						font-size: 3rem;
						font-weight: 700;
						color: #0070f3;
						margin-bottom: 0.5rem;
					}

					.stat-desc {
						font-size: 1.1rem;
						color: #666;
					}
					.features-grid {
						display: grid;
						grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
						gap: 1.5rem;
						margin-top: 2rem;
					}

					.feature {
						background-color: #f8fafc;
						border-radius: 8px;
						padding: 1.5rem;
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
						transition: transform 0.2s, box-shadow 0.2s;
					}

					.feature:hover {
						transform: translateY(-3px);
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
					}

					.feature h3 {
						color: #0070f3;
						font-size: 1.3rem;
						margin-top: 0;
						margin-bottom: 1rem;
					}

					.feature p {
						margin: 0;
					}

					.ege-stats {
						display: grid;
						grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
						gap: 1.5rem;
						margin: 2rem 0;
					}

					.ege-subject h3 {
						margin-top: 0;
						font-size: 1.2rem;
					}

					.progress-bar {
						width: 100%;
						height: 30px;
						background-color: #e1e1e1;
						border-radius: 15px;
						overflow: hidden;
					}

					.progress {
						height: 100%;
						background: linear-gradient(90deg, #0070f3, #00c6ff);
						display: flex;
						align-items: center;
						justify-content: flex-end;
						padding: 0 10px;
						color: white;
						font-weight: bold;
						transition: width 1s ease-in-out;
					}

					.ege-subject p {
						font-size: 0.9rem;
						color: #666;
						text-align: center;
						margin-top: 0.5rem;
					}

					.achievements {
						background-color: #f0f7ff;
						border-radius: 8px;
						padding: 1.5rem;
						margin-top: 2rem;
					}

					.achievements h3 {
						color: #0051af;
						margin-top: 0;
					}

					.achievements ul {
						padding-left: 1.5rem;
					}

					.achievements li {
						margin-bottom: 0.7rem;
						color: #333;
						font-size: 1.05rem;
					}
					.teachers-recommendations {
						margin-top: 1.5rem;
					}

					.recommendation {
						background-color: #f8fafc;
						border-left: 4px solid #0070f3;
						padding: 1.2rem 1.5rem;
						margin-bottom: 1.5rem;
						border-radius: 0 8px 8px 0;
					}

					.recommendation h4 {
						margin-top: 0;
						margin-bottom: 1rem;
						color: #0051af;
						font-size: 1.2rem;
					}

					.recommendation p {
						margin-bottom: 0.7rem;
						font-size: 1rem;
					}

					.recommendation p:last-child {
						margin-bottom: 0;
					}
					.programs-grid {
						display: grid;
						grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
						gap: 1.5rem;
						margin-top: 1.5rem;
					}

					.program {
						background-color: #f8fafc;
						border-radius: 8px;
						padding: 1.5rem;
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
						height: 100%;
					}

					.program h3 {
						color: #0070f3;
						font-size: 1.2rem;
						margin-top: 0;
						margin-bottom: 1rem;
					}

					.program p {
						margin: 0;
						font-size: 1rem;
					}
					.cta-section {
						text-align: center;
						padding: 3rem 2rem;
						background: linear-gradient(135deg, #f5f7fa 0%, #e4eff9 100%);
					}

					.cta-section h2 {
						border-bottom: none;
					}

					.cta-button {
						background: linear-gradient(90deg, #0070f3, #00c6ff);
						color: white;
						border: none;
						border-radius: 8px;
						padding: 0.8rem 2rem;
						font-size: 1.2rem;
						font-weight: 600;
						cursor: pointer;
						margin-top: 1.5rem;
						transition: transform 0.2s, box-shadow 0.2s;
					}

					.cta-button:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
					}

					@media (max-width: 768px) {
						.page-title {
							font-size: 2rem;
						}

						.section {
							padding: 1.5rem;
						}

						.stat-item {
							min-width: 140px;
							padding: 1rem;
						}

						.stat-number {
							font-size: 2.5rem;
						}

						.features-grid,
						.programs-grid,
						.ege-stats {
							grid-template-columns: 1fr;
						}
					}
				`}</style>
			</div>
		)
}