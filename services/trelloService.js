const axios = require('axios');
require('dotenv').config();

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

async function createTrelloBoard(deal) {
  const dealName = deal.Deal_Name || deal.Name || 'Untitled Deal';
  const boardName = `Project: ${dealName}`;

  try {
    //  Create the Trello board
    const boardRes = await axios.post(`https://api.trello.com/1/boards/`, null, {
      params: {
        name: boardName,
        defaultLists: false,
        key: TRELLO_API_KEY,
        token: TRELLO_TOKEN,
      }
    });

    const boardId = boardRes.data.id;
    const boardUrl = boardRes.data.url;

    console.log(' Full Trello board creation response:', JSON.stringify(boardRes.data, null, 2));
    console.log(` Trello board ID: ${boardId}`);
    console.log(` Trello board URL: ${boardUrl}`);

    //  Create 3 lists
    const listNames = ['To Do', 'In Progress', 'Done'];
    const listIds = [];

    for (const name of listNames) {
      const listRes = await axios.post(`https://api.trello.com/1/boards/${boardId}/lists`, null, {
        params: {
          name,
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
        }
      });

      listIds.push({ name, id: listRes.data.id });
    }

    //  Add 3 cards to the "To Do" list
    const toDoList = listIds.find(l => l.name === 'To Do');

    const cards = ['Kickoff Meeting Scheduled', 'Requirements Gathering', 'System Setup'];

    for (const name of cards) {
      await axios.post(`https://api.trello.com/1/cards`, null, {
        params: {
          name,
          idList: toDoList.id,
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
        }
      });
    }

    console.log(`Trello board created: ${boardName}`);
    return boardId; //  Return board ID only, as required
  } catch (err) {
    console.error(' Trello board creation failed:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createTrelloBoard };
