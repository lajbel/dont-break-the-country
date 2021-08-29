kaboom({
	global: true,
	width: 400,
	height: 700,
	debug: true,
	clearColor: [1, 1, 1]
});

loadSound("music", "./sounds/music.ogg");
loadSound("select", "./sounds/select.wav");
loadSound("down", "./sounds/down.wav");
loadSound("up", "./sounds/up.wav");
loadSprite("background", "./sprites/background.png");
loadSprite("loose", "./sprites/loose.png");
loadSprite("win", "./sprites/win.png")
loadSprite("regular", "./sprites/regular.png");
loadSprite("menu", "./sprites/menu.png");
loadSprite("logo", "./sprites/logo.png");
loadSprite("money", "./sprites/money.png");
loadSprite("money_fly", "./sprites/money_fly.png");
loadSprite("money_down", "./sprites/money_down.png");
loadSprite("people", "./sprites/people.png");
loadSprite("people_up", "./sprites/people_up.png");
loadSprite("people_down", "./sprites/people_down.png");
loadSprite("president", "./sprites/president.png", {
	sliceX: 1,
	sliceY: 2,
	anims: {
		main: {
			from: 0,
			to: 1
		}
	}
});

scene("menu", () => {
	add([
		sprite("menu"),
		scale(10)
	]);

	add([
		sprite("logo"),
		scale(9),
		pos(width() / 2, 200),
		origin("center")
	]);

	add([
		text("CLICK FOR START"),
		pos(width() / 2, 380),
		origin("center")
	]);

	action(() => {
		if (mouseIsClicked()) {
			go("game");
		};
	});
});

scene("game", () => {
	let inCooldown;
	let people = 0;
	let money = 4000;
	let questionsCount = 0;

	// Questions

	const questions = [
		{
			question: "The population of your country says that you have a stupid face",
			answers: [
				{
					text: "Cry in the bathroom",
					result: "They made memes of you, now the young population wants you more",
					effects: [{ e: "people_up", c: 1 }],
				},
				{
					text: "Raise taxes (steal)",
					result: "You've earned enough money to buy yourself a new face, but your population hates you",
					effects: [{e: "money_up", c: 1000 }, {e: "people_down", c: 1}]
				},
				{
					text: "Nothinng ._.",
					result: "That was strange, but what more gives, that nothing lowers your mood, take $1 free",
					effects: [{e: "money_up", c: 1}]
				}
			]
		},
		{
			question: "A spatial association suspects an imposter in the establishment of them",
			answers: [
				{
					text: "THE BLACK IS SUS",
					result: "After executing the black, they discovered that he was not the imposter, they have charged you $5000",
					effects: [{ e: "money_down", c: 5000 }],
				},
				{
					text: "Call the FBI",
					result: "After a long investigation of 15 minutes, they have discovered that it was the wrong number",
					effects: [],
				},
				{
					text: "Sleep",
					result: "The imposter has detonated the space center, now the terraplanista population has maxified.",
					effects: [{ e: "people_down", c: 1 }],
				}
			]
		},
		{
			question: "An industry offers large amounts of money to bring 'sugar' into the country",
			answers: [
				{
					text: "Let pass",
					result: "Obesity has grown 30% more in the country, and they blame you",
					effects: [{ e: "money_up", c: 3000 }, { e: "people_down", c: 1 }]
				},
				{
					text: "Deny",
					result: "After denying the company, he decided to traffic cocaine into the country, increasing drug trafficking and insecurity",
					effects: [{ e: "people_down", c: 1 }]
				}
			]
		},
		{
			question: "The president of Amurquia has declared war on you with swords, but not exactly with soldiers...",
			answers: [
				{
					text: "Combat",
					result: "...                                           No comments.",
					effects: [{ e: "money_up", c: 1000 }]
				},
				{
					text: "Deny",
					result: "You have denied war, but now you feel that someone is watching you.",
					effects: [{}],
				}
			]
		},
		{
			question: "The alien association of the roadactea threatens the country",
			answers: [
				{
					text: "ATTACK",
					result: "The bombs with pictures of your mother have been propelled towards the enemy, they have died of excitement",
					effects: [{ e: "money_up", c: 1000 }]
				},
				{
					text: "Refrain from battling",
					result: "The aliens Are gone peacefully, your population loves you",
					effects: [{ e: "people_up", c: 1 }],
				},
			]
		}
	];

	function removeQuestion(item) {
		let i = questions.indexOf(item);

		if (i !== -1) {
			questions.splice(i, 1);
		}
	};

	const music = play("music");
	music.loop(true);

	add([
		sprite("background", { noArea: true }),
		scale(10)
	]);

	const moneyIcon = add([
		sprite("money", { noArea: true }),
		pos(10, 10),
		scale(4),
	]);

	const moneyCount = add([
		text(":" + money, 20),
		pos(moneyIcon.pos.x + 60, moneyIcon.pos.y + 20),
		origin("left")
	]);

	const peopleIcon = add([
		sprite("people", { noArea: true }),
		pos(width() - 160, 10),
		scale(4)
	]);

	add([
		text(":"),
		pos(peopleIcon.pos.x + 20, peopleIcon.pos.y + 20),
		origin("left"),
	]);

	const peopleStatus = add([
		text("NEUTRAL"),
		pos(peopleIcon.pos.x + 40, peopleIcon.pos.y + 20),
		origin("left"),
		color(0.968, 0.905, 0.2)
	]);

	const president = add([
		sprite("president", { noArea: true, animSpeed: 0.8 }),
		scale(3.5),
		pos(70, height()),
		origin("bot")
	]);

	const resultText = add([
		text("", 19, { width: width() + 10 }),
		color(0.239, 0.239, 0.239),
		pos(10, 330)
	]);

	president.play("main");

	// Functions

	function chooseQuestion() {
		questionsCount += 1;

		if (questionsCount > 3) {
			music.stop();

			if (money > 10000 && people == 1) {
				go("loose");
			}
			else if (money < 10000 && people == -1) {
				go("win");
			}
			else {
				go("regular");
			};
		};

		let question = choose(questions);
		removeQuestion(question);
		return question;
	};

	function loadQuestion(question) {
		let lastAnswer;
		resultText.text = "";

		add([
			text(question.question, 20, { width: width() + 10 }),
			color(0.239, 0.239, 0.239),
			pos(10, 100),
			"question"
		]);

		for (let i = 0; i < question.answers.length; i++) {
			let q = add([
				text(question.answers[i].text, 17, { width: 250 }),
				pos(275, lastAnswer ? lastAnswer.pos.y + 50 : 510),
				origin("top"),
				color(0.098, 0.09, 0.094),
				area(),
				"answer",
				{
					inHover: false,
					result: question.answers[i].result,
					to: question.answers[i].to,
					effects: question.answers[i].effects
				}
			]);

			lastAnswer = q;
		};

		inCooldown = false;
		lastAnswer = null;
	};

	async function processAnswer(ans) {
		inCooldown = true;
		resultText.text = ans.result;

		wait(0.1, () => {
			const awaitClick = action(() => {
				if (mouseIsClicked()) {
					every("answer", (a) => { destroy(a) });
					every("question", (q) => destroy(q));

					for (let i = 0; i < ans.effects.length; i++) {
						if (ans.effects[i].e == "money_up") {
							moneyUp(ans.effects[i].c);
						};

						if (ans.effects[i].e == "money_down") {
							moneyDown(ans.effects[i].c);
						};

						if(ans.effects[i].e == "people_up") {
							peopleUp(ans.effects[i].c);
						};

						if(ans.effects[i].e == "people_down") {
							peopleDown(ans.effects[i].c);
						};
					};

					if(questionsCount < 3) {
						loadQuestion(chooseQuestion());
					}
					else {
						wait(4, () => loadQuestion(chooseQuestion()));
					}
					
					awaitClick();
				};
			});
		});
	};

	loadQuestion(chooseQuestion());

	// Events (Functions)

	function moneyUp(m) {
		play("up");

		const mf = add([
			sprite("money_fly"),
			pos(moneyIcon.pos.x + 5, moneyIcon.pos.y + 10),
			scale(4)
		]);

		mf.action(() => {
			mf.move(0, -60);
		});

		wait(0.2, () => {
			money += m;
			moneyCount.text = ":" + money;
		});

		wait(2, () => destroy(mf));
	};


	function moneyDown(m) {
		play("down");

		const md = add([
			sprite("money_down"),
			pos(moneyIcon.pos.x + 5, moneyIcon.pos.y - 10),
			scale(4)
		]);

		md.action(() => {
			md.move(0, 60);
		});

		wait(0.2, () => {
			money -= m;
			moneyCount.text = ":" + money;
		});

		wait(2, () => destroy(md));
	};

	function peopleUp(c) {
		play("up");

		pd = add([
			sprite("people_up"),
			pos(peopleIcon.pos.x + 5, moneyIcon.pos.y + 10),
			scale(4)
		]);

		pd.action(() => {
			pd.move(0, -60)
		});

		wait(0.1, () => {
			people += c;
			
			if(people == 0) {
				peopleStatus.text = "NEUTRAL";
			}
			else if(people == 1) {
				peopleStatus.text = "GOOD";
			}
			else if(people == -1) {
				peopleStatus.text = "BAD";
			}
		});

		wait(2, () => destroy(pd));
	};

	function peopleDown(c) {
		play("down");

		pd = add([
			sprite("people_down"),
			pos(peopleIcon.pos.x + 5, moneyIcon.pos.y - 10),
			scale(4)
		]);

		pd.action(() => {
			pd.move(0, 60)
		});

		wait(0.2, () => {
			people -= c;
			
			if(people == 0) {
				peopleStatus.text = "NEUTRAL";
			}
			else if(people == 1) {
				peopleStatus.text = "GOOD";
			}
			else if(people == -1) {
				peopleStatus.text = "BAD";
			}
		});

		wait(2, () => destroy(pd));
	};

	// Actions

	action("answer", (a) => {
		if (a.isHovered() && !inCooldown && !a.inHover) {
			a.color = rgb(0.141, 0.302, 0.678);
			play("select");
			a.inHover = true;
		}
		else if (!a.isHovered() && !inCooldown) {
			a.color = rgb(0.239, 0.239, 0.239);
			a.inHover = false;
		}

		if (a.isClicked() && !inCooldown) {
			processAnswer(a);
		};
	});

	// Loops

	loop(0.5, () => {
		if (!inCooldown) {
			resultText.text += "."

			if (resultText.text.length == 4) {
				resultText.text = "."
			}
		}
	});
});

scene("win", () => {
	add([
		sprite("win"),
		scale(10)
	]);

	add([
		text("EXCELENT president, YOU'VE BRAKE THE COUNTRY, definitely the winner of this shit game..... [Click to menu]", 20, { width: 400 }),
		pos(10, 40)
	]);

	action(() => {
		if (mouseIsClicked()) {
			go("menu");
		};
	});
});

scene("loose", () => {
	add([
		sprite("loose"),
		scale(10)
	]);

	add([
		text("Congratulations! You've been a great president, so good that snipers have killed you, well, maybe good presidents aren't so dear.... [Click to menu]", 20, { width: 400 }),
		pos(10, 40)
	]);

	action(() => {
		if (mouseIsClicked()) {
			go("menu");
		};
	});
});

scene("regular", () => {
	add([
		sprite("regular"),
		scale(10)
	]);

	add([
		text("It was Normal, maybe you should play again, I really don't want to make any more finals, at least you should follow the title..... [Click to menu]", 20, { width: 400 }),
		pos(10, 40)
	]);

	action(() => {
		if (mouseIsClicked()) {
			go("menu");
		};
	});
});

go("loose");