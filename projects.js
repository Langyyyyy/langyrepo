document.addEventListener('DOMContentLoaded', () => {
  const projects = [
    {
      title: "Wordle Game",
      description: "A fun web-based word-guessing game, inspired by the popular Wordle.",
      image: "images/wordle-thumbnail.png", // Using a more specific thumbnail
      link: "wordle.html"
    },
    {
      title: "Word Fold Game",
      description: "An engaging word puzzle game where you fold words.",
      image: "images/wordfold-thumbnail.png", // Suggesting a specific thumbnail for Word Fold
      link: "wordfold/game.html"
    },
    {
      title: "Weather App",
      description: "A simple web application to check current weather conditions.",
      image: "images/weather-thumbnail.png", // Suggesting a specific thumbnail for Weather App
      link: "weatherapp/index.html"
    }
  ];

  const projectGrid = document.getElementById('projectGrid');

  if (projectGrid) {
    projects.forEach(project => {
      // Create elements one by one for better control
      const card = document.createElement('div');
      card.className = 'project-card';

      const link = document.createElement('a');
      link.href = project.link;
      link.className = 'project-image-link';

      const img = document.createElement('img');
      img.src = project.image;
      img.alt = `${project.title} Thumbnail`;

      // THIS IS THE IMPORTANT PART: The error "detective"
      img.onerror = function() {
        console.error(`Image not found for project: "${project.title}". Attempted to load: "${this.src}". Please check that the file exists at this exact path and the filename is correct (including capitalization).`);
        // Add a visual indicator on the page that the image is missing
        const errorText = document.createTextNode(`Image not found: ${project.image}`);
        link.innerHTML = ''; // Clear the broken image
        link.appendChild(errorText);
      };

      const cardContent = document.createElement('div');
      cardContent.className = 'card-content';
      cardContent.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>`;

      // Put the pieces together
      link.appendChild(img);
      card.appendChild(link);
      card.appendChild(cardContent);
      projectGrid.appendChild(card);
    });
  }
});