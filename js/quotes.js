/* quotes.js - Curated Motivational Quotes System */

window.EduQuotes = (() => {
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
        { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
        { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
        { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
        { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" }
    ];

    function getRandomQuote() {
        const index = Math.floor(Math.random() * quotes.length);
        return quotes[index];
    }

    function renderQuote(containerEl) {
        if (!containerEl) return;
        
        const quote = getRandomQuote();
        
        // Dynamic styling for transitions
        containerEl.style.opacity = 0;
        containerEl.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            containerEl.innerHTML = `
                <div class="quote-text">“${quote.text}”</div>
                <div class="quote-author">— ${quote.author}</div>
            `;
            containerEl.style.opacity = 1;
        }, 150);
    }

    return {
        getRandomQuote,
        renderQuote
    };
})();
