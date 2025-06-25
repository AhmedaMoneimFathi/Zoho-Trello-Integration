const axios = require('axios');
require('dotenv').config();

async function getAccessToken() {
  const {
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN
  } = process.env;

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error(' Error getting Zoho access token:', error.response?.data || error.message);
    throw error;
  }
}

async function fetchDeals() {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.get('https://www.zohoapis.com/crm/v2/Deals', {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      params: {
        fields: 'Deal_Name,Stage,Type,Project_Board_ID_c',
      }
    });

    const deals = response.data.data;

    // Only match by stage & type
    const filtered = deals.filter(deal =>
      deal.Stage === 'Project Kickoff' &&
      deal.Type === 'New Implementation Project'
    );

    return filtered;
  } catch (error) {
    console.error(' Error fetching deals:', error.response?.data || error.message);
    return [];
  }
}

async function updateDealWithBoardId(dealId, boardId) {
  const accessToken = await getAccessToken();

  const updatePayload = {
    data: [
      {
        id: dealId,
        Project_Board_ID_c: boardId
      }
    ]
  };

  try {
    const response = await axios.put(
      'https://www.zohoapis.com/crm/v2/Deals',
      updatePayload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log(` Deal updated with Trello Board ID: ${boardId}`);
    return response.data;
  } catch (error) {
    console.error(' Error updating Zoho deal:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  fetchDeals,
  updateDealWithBoardId
};
