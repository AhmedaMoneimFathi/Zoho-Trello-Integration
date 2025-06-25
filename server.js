const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const { fetchDeals, updateDealWithBoardId } = require('./services/zohoService');
const { createTrelloBoard } = require('./services/trelloService');

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());

// Integration endpoint
app.post('/integrate', async (req, res) => {
  try {
    const deals = await fetchDeals();
    const results = [];

    if (deals.length === 0) {
      console.log(' No eligible deals found for integration.');
    }

    for (const deal of deals) {
      if (deal.Project_Board_ID_c) {
        console.log(` Already integrated: "${deal.Deal_Name}" (Board ID: ${deal.Project_Board_ID_c})`);
        results.push({ deal: deal.Deal_Name, status: 'already_integrated' });
        continue;
      }

      console.log(` Creating Trello board for deal: "${deal.Deal_Name}"`);
      const boardId = await createTrelloBoard(deal);

      await updateDealWithBoardId(deal.id, boardId);
      console.log(` Integrated "${deal.Deal_Name}" with Trello board ID: ${boardId}`);

      results.push({ deal: deal.Deal_Name, status: 'created', boardId });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error(' Integration Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
