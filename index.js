const { fetchDeals, updateDealWithBoardId } = require('./services/zohoService');
const { createTrelloBoard } = require('./services/trelloService');

(async () => {
  try {
    const deals = await fetchDeals();

    if (deals.length === 0) {
      console.log(' No matching deals found.');
      return;
    }

    for (const deal of deals) {
      if (deal.Project_Board_ID_c) {
        console.log(` Deal "${deal.Deal_Name}" already has a Trello board. Skipping.`);
        continue;
      }

      console.log(` Creating Trello board for deal: ${deal.Deal_Name}`);
      const boardId = await createTrelloBoard(deal);

      await updateDealWithBoardId(deal.id, boardId);

      console.log(` Done: Deal "${deal.Deal_Name}" linked to board ID ${boardId}`);
    }
  } catch (err) {
    console.error(' Error:', err.message);
  }
})();
