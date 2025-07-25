document.addEventListener('DOMContentLoaded', () => {
    const initialFeedbackSection = document.getElementById('initial-feedback-section'); 
    const companyLogo = document.getElementById('company-logo'); 
    const companyNameSpan = document.getElementById('company-name'); 
    const starRating = document.getElementById('star-rating');
    const stars = starRating.querySelectorAll('.star');
    const feedbackLowScore = document.getElementById('feedback-low-score');
    const improvementOptionsContainer = feedbackLowScore.querySelector('.improvement-options');
    const optionButtons = improvementOptionsContainer.querySelectorAll('.option-button');
    const otherFeedbackTextarea = document.getElementById('other-feedback');
    const submitLowScoreButton = document.getElementById('submit-low-score');
    const thankYouMessage = document.getElementById('thank-you-message');
    const backToStarsButton = document.getElementById('back-to-stars'); 
    const resetAppButton = document.getElementById('reset-app'); 

    let selectedRating = 0; 
    let selectedOptions = new Set(); 

    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const company = urlParams.get('nomEntreprise') || 'votre expérience'; 
    const logo = urlParams.get('logoUrl');
    const googleReviewUrlFromParam = urlParams.get('googleUrl') || 'https://www.google.com'; 

    // Mettre à jour le texte du titre
    companyNameSpan.textContent = company;

    // Afficher le logo si l'URL est fournie
    if (logo) {
        companyLogo.src = logo;
        companyLogo.classList.remove('hidden');
    } else {
        companyLogo.classList.add('hidden'); 
    }

    // ⭐⭐⭐ INFORMATIONS POUR FORMSPREE IMMOBILIER ⭐⭐⭐
    // L'URL Formspree fournie pour l'immobilier :
    const FORMSPREE_ACTION_URL = 'https://formspree.io/f/xqalqbnn';
    
    // Noms des champs pour Formspree (pour l'Immobilier) :
    const FORM_FIELD_NAMES = {
        note: 'Note_de_l_experience',             
        options: 'Options_d_amelioration',        
        commentaire: 'Commentaire_Libre',      
        nomEntreprise: 'Nom_Entreprise_Client',   
        urlLogo: 'URL_Logo_Client',         
    };
    // ⭐⭐⭐ FIN DES INFOS FORMSPREE IMMOBILIER ⭐⭐⭐


    // Fonction pour mettre à jour l'affichage des étoiles
    function updateStarDisplay(ratingValue) { 
        console.log(`[updateStarDisplay] Appelée avec ratingValue: ${ratingValue}`);
        stars.forEach((s, index) => {
            if (index < ratingValue) {
                s.classList.add('selected');
                console.log(`[updateStarDisplay] Étoile ${index + 1} a la classe 'selected'.`);
            } else {
                s.classList.remove('selected');
                console.log(`[updateStarDisplay] Étoile ${index + 1} n'a pas la classe 'selected'.`);
            }
        });
    }

    // Fonction pour réinitialiser l'application à son état initial
    function resetApplication() { 
        selectedRating = 0;
        selectedOptions.clear();
        otherFeedbackTextarea.value = '';
        optionButtons.forEach(btn => btn.classList.remove('selected')); 

        updateStarDisplay(0); 
        starRating.classList.remove('rated'); 

        initialFeedbackSection.classList.remove('hidden'); 
        feedbackLowScore.classList.add('hidden');
        thankYouMessage.classList.add('hidden');
        submitLowScoreButton.classList.remove('hidden'); 
        
        toggleStarListeners(true); 
    }

    // Fonction pour activer/désactiver les écouteurs de clic et survol sur les étoiles
    function toggleStarListeners(enable) {
        stars.forEach(star => {
            if (enable) {
                star.addEventListener('click', handleStarClick);
                star.addEventListener('mouseover', handleStarMouseOver);
                star.addEventListener('mouseout', handleStarMouseOut);
                star.style.cursor = 'pointer'; 
            } else {
                star.removeEventListener('click', handleStarClick);
                star.removeEventListener('mouseover', handleStarMouseOver);
                star.removeEventListener('mouseout', handleStarMouseOut);
                star.style.cursor = 'default'; 
            }
        });
    }

    // Gestionnaire de clic sur étoile
    function handleStarClick() { 
        selectedRating = parseInt(this.dataset.value); 
        console.log(`[handleStarClick] Étoile cliquée: ${selectedRating}`);
        updateStarDisplay(selectedRating); 
        starRating.classList.add('rated'); 

        toggleStarListeners(false); 

        initialFeedbackSection.classList.add('hidden');

        if (selectedRating <= 3) {
            feedbackLowScore.classList.remove('hidden');
            thankYouMessage.classList.add('hidden'); 
        } else {
            window.location.href = googleReviewUrlFromParam; 
        }
    }

    // Gestionnaire de survol d'étoile
    function handleStarMouseOver() { 
        if (!starRating.classList.contains('rated')) { 
            const hoverValue = parseInt(this.dataset.value);
            console.log(`[handleStarMouseOver] Survol de l'étoile: ${hoverValue}`);
            updateStarDisplay(hoverValue);
        }
    }

    // Gestionnaire de sortie de survol d'étoile
    function handleStarMouseOut() { 
        if (!starRating.classList.contains('rated')) { 
            console.log("[handleStarMouseOut] Sortie de survol, réinitialisation.");
            updateStarDisplay(0); 
        } else { 
            console.log(`[handleStarMouseOut] Sortie de survol, affichage de la note sélectionnée: ${selectedRating}.`);
            updateStarDisplay(selectedRating);
        }
    }

    // Gestion des options d'amélioration pour les notes basses (sélection multiple)
    optionButtons.forEach(button => { 
        button.addEventListener('click', () => {
            const optionValue = button.dataset.option;
            if (selectedOptions.has(optionValue)) {
                selectedOptions.delete(optionValue);
                button.classList.remove('selected');
            } else {
                selectedOptions.add(optionValue);
                button.classList.add('selected');
            }
        });
    });

    // --- CETTE SECTION ENVOIE LES DONNÉES À FORMSPREE ---
    submitLowScoreButton.addEventListener('click', async () => { 
        const comments = otherFeedbackTextarea.value.trim();
        
        const formData = new FormData();
        formData.append(FORM_FIELD_NAMES.note, selectedRating);
        
        Array.from(selectedOptions).forEach(option => {
            formData.append(FORM_FIELD_NAMES.options, option); 
        });
        
        formData.append(FORM_FIELD_NAMES.commentaire, comments);
        formData.append(FORM_FIELD_NAMES.nomEntreprise, company); 
        formData.append(FORM_FIELD_NAMES.urlLogo, logo);         

        try {
            const response = await fetch(FORMSPREE_ACTION_URL, {
                method: 'POST',
                body: formData,
                headers: { 
                    'Accept': 'application/json' 
                }
            });

            if (response.ok) { 
                console.log("Feedback envoyé à Formspree Immobilier avec succès !");
                feedbackLowScore.classList.add('hidden');
                thankYouMessage.classList.remove('hidden');
                initialFeedbackSection.classList.add('hidden'); 

            } else {
                const errorData = await response.json(); 
                console.error("Erreur lors de l'envoi du feedback à Formspree. Statut :", response.status, "Erreur:", errorData);
                alert("Une erreur est survenue lors de l'envoi de votre feedback. Veuillez réessayer. Code: " + response.status);
            }

        } catch (error) {
            console.error("Erreur réseau ou autre lors de l'envoi du feedback à Formspree :", error);
            alert("Une erreur est survenue lors de l'envoi de votre feedback. Veuillez réessayer.");
        }
    });

    // Gestion du bouton "Retour"
    backToStarsButton.addEventListener('click', () => { 
        feedbackLowScore.classList.add('hidden');
        initialFeedbackSection.classList.remove('hidden'); 
        starRating.classList.remove('rated'); 
        toggleStarListeners(true); 
    });

    // Gestion du bouton "Fermer"
    resetAppButton.addEventListener('click', () => { 
        window.location.href = 'https://www.google.com'; 
    });

    // Initialisation
    resetApplication(); 
});
