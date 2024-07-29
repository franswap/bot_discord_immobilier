import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'immobilier') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: getRandomEmoji() + 'Nous allons revolutionner le marché de l\'immobilier ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'challenge' && id) {
      const userId = req.body.member.user.id;
      const objectName = req.body.data.options[0].value;

      activeGames[id] = {
        id: userId,
        objectName,
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `accept_button_${req.body.id}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }

    if (name === 'properties') {
      const houses = [
    { id: 'house1', name: 'Maison de la Plage' },
    { id: 'house2', name: 'Villa au Bord du Lac' },
    { id: 'house3', name: 'Chalet en Montagne' },
    { id: 'house4', name: 'Appartement en Ville' },
    { id: 'house5', name: 'Maison de Campagne' },
      ];

      const components = houses.map(house => ({
        type: MessageComponentTypes.BUTTON,
        custom_id: `house_${house.id}`,
        label: house.name,
        style: ButtonStyleTypes.PRIMARY,
      }));

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Veuillez sélectionner une maison:',
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: components,
            },
          ],
        },
      });
    }
  }

if (type === InteractionType.MESSAGE_COMPONENT) {
  const componentId = data.custom_id;

  if (componentId.startsWith('house_')) {
    const houseId = componentId.split('_')[1];
    const houses = {
      house1: 'Maison de la Plage',
      house2: 'Villa au Bord du Lac',
      house3: 'Chalet en Montagne',
      house4: 'Appartement en Ville',
      house5: 'Maison de Campagne',
    };
    const houseName = houses[houseId];

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Vous avez sélectionné la ${houseName}, nous vous recontacterons bientôt.`,
      },
    });
  }
}

});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

