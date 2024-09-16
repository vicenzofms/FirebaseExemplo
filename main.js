			// Import the functions you need from the SDKs you need
			import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
			import {
				getAuth,
				createUserWithEmailAndPassword,
				signInWithEmailAndPassword,
			} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
			import {
				getFirestore,
				addDoc,
				setDoc,
				doc,
				deleteDoc,
				collection,
				getDocs,
			} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

			const firebaseConfig = {
				apiKey: "AIzaSyCdstBHVKm9mfjgGGtUBL6aj1yD_3S928c",
				authDomain: "aprendendodatabase.firebaseapp.com",
				databaseURL: "https://aprendendodatabase.firebaseio.com",
				projectId: "aprendendodatabase",
				storageBucket: "aprendendodatabase.appspot.com",
				messagingSenderId: "643614270319",
				appId: "1:643614270319:web:a4d00d42f97f6560313e9a",
				measurementId: "G-SQWYZ1BLYX",
			};

			// Initialize Firebase &  Constantes do Firebase
			const app = initializeApp(firebaseConfig);
			const auth = getAuth(app);
			const db = getFirestore(app);
			const postsCol = collection(db, "posts");

            export {firebaseConfig, app, auth, postsCol};

			// Variavél de controle do estado do usuário
			let userState = null;

			// Array de posts
			let posts = [];

			// Toda vez que o estado de autenticação mudar essa função é chamada
			auth.onAuthStateChanged((user) => {
				if (user) {
					// usuário está logado
					console.log("Estamos logados!");
					console.log(`UID do usuário: ${user.uid}`);

					btnSignout.style = "display: block;";
					createAccountDiv.style = "display: none;";
					loginAccountDiv.style = "display: none;";
					userState = user;
					carregarPosts();
					return;
				}
				// usuário não está logado
				userState = null;
				carregarPosts();
				btnSignout.style = "display: none;";
				createAccountDiv.style = "display: block;";
				loginAccountDiv.style = "display: block;";
				console.log("Não estamos logados!");
			});

			// elementos HTML que vamos usar ao longo do código
			let btnCriarConta = document.getElementById("createAccountBtn");
			let btnSignout = document.getElementById("signoutBtn");
			let btnPost = document.getElementById("postBtn");
			let btnLogin = document.getElementById("loginAccountBtn");
			let inputCriarContaEmail =
				document.getElementById("emailInputCreate");
			let inputCriarContaSenha = document.getElementById(
				"passwordInputCreate"
			);
			let inputCriarContaCPF = document.getElementById("cpfInput");
			let inputPost = document.getElementById("postInput");
			let inputLoginEmail = document.getElementById("emailInputLogin");
			let inputLoginSenha = document.getElementById("passwordInputLogin");
			let listaDePosts = document.getElementById("listaDePosts");

			let createAccountDiv = document.getElementById("createAccountDiv");
			let loginAccountDiv = document.getElementById("loginAccountDiv");

			// função responsável por gerar os elementos HTML para cada post
			function carregarPosts() {
				listaDePosts.innerHTML = ""; // limpa os posts já carregados

				// função do Firebase que pega todos os documentos de uma collection
				getDocs(postsCol).then((docs) => {
					// para cada documento em docs
					docs.forEach((postDoc) => {
						// criamos um obj com todos os dados do documento do firebase
						const postObj = postDoc.data();

						const liEl = document.createElement("li");
						liEl.className = "post";
						const pMsgEl = document.createElement("p");
						const pAuthorEl = document.createElement("p");

						pMsgEl.className = "message";
						pAuthorEl.className = "author";
						// atribuimos os devidos textos aos elementos HTML
						pMsgEl.innerText = postObj.mensagem;
						pAuthorEl.innerText = postObj.creatorEmail;

						liEl.appendChild(pMsgEl);
						liEl.appendChild(pAuthorEl);

						if (userState) {
							// se meu Usuário existe
							// se o usuário logado for o dono do post
							if (userState.uid === postObj.creatorId) {
								// cria um botão de delete
								const btnDelete =
									document.createElement("button");
								btnDelete.className = "deletePostBtn";
								btnDelete.innerText = "Deletar";
								btnDelete.addEventListener("click", () => {
									// cria um alert de confirmação
									if (
										confirm(
											"Tem certeza que deseja deletar?"
										)
									) {
										// função do firebase para deletar o documento
										// postDoc.id se refere ao id desse post que está sendo carregado
										deleteDoc(
											doc(db, "posts", postDoc.id)
										).then(() => {
											// ao terminar de deletar recarregar os posts
											carregarPosts();
										});
									}
								});
								liEl.appendChild(btnDelete);
							}
						}

						listaDePosts.appendChild(liEl);
					});
				});
			}

			// ação de criar uma conta
			btnCriarConta.addEventListener("click", () => {
				// pegar os valores dos inputs
				const email = inputCriarContaEmail.value;
				const password = inputCriarContaSenha.value;
				const cpf = inputCriarContaCPF.value;

				// cancela tudo se não houver um email, senha ou cpf digitados
				if (!email || !password || !cpf) {
					console.error("Dados invalidos!");
					return;
				}

				// função de criar um usuário do firebase passando email e senha como argumentos
				createUserWithEmailAndPassword(auth, email, password).then(
					(credenciais) => {
						// recebe um obj de credenciais caso dê certo
						// função para criar um documento na Collection "users" com o UID do usuário criado
						// esse documento salvará o CPF digitado pelo usuário
						setDoc(doc(db, "users", credenciais.user.uid), {
							cpf: cpf,
						});
					}
				);
			});

			// ação de tentar logar
			btnLogin.addEventListener("click", () => {
				// pegar os valores dos inputs
				const email = inputLoginEmail.value;
				const password = inputLoginSenha.value;

				// cancela tudo se não houver um email ou senha digitados
				if (!email || !password) {
					console.error("Dados invalidos!");
					return;
				}

				// função do firebase para tentar logar utilizando o email e a senha digitados
				signInWithEmailAndPassword(auth, email, password);
			});

			// ação de deslogar
			btnSignout.addEventListener("click", () => {
				// chama a função do firebase para deslogar o usuário logado
				auth.signOut();
			});

			// ação de postar
			btnPost.addEventListener("click", () => {
				// busca a mensagem digitada no input
				const message = inputPost.value;

				// cancela tudo se não houver uma mensagem ou se a pessoa não estiver logada
				if (!message || !userState) {
					alert("A mensagem é invalida ou você não está logado!");
					return;
				}

				// cria um objeto de post que será salvo no firebase
				const post = {
					mensagem: message,
					creatorEmail: userState.email,
					creatorId: userState.uid,
				};

				// função do firebase que adiciona um documento a coleção de posts
				// postsCol é a referência que contém a coleção e foi declarado mais acima
				addDoc(postsCol, post)
					.then((doc) => {
						// quando o post for realizado, recarregar os posts do firebase, atualizando a UI
						carregarPosts();
					})
					.catch((erro) => {
						console.log(erro);
					});
			});

			// carrega os posts quando iniciar o programa