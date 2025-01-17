import tornado
import os
import logging
import requests
from openai import OpenAI
import json
import re
import uuid
import datetime
import time
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
server_log = logging.getLogger('server')
chat_log = logging.getLogger('chat')


class CorsHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')

    def options(self, *args):
        self.set_header('Access-Control-Allow-Methods', '*')
        self.set_header('Access-Control-Request-Credentials', 'true')
        self.set_header('Access-Control-Allow-Private-Network', 'true')
        self.set_header('Access-Control-Allow-Headers', '*')
        self.set_status(204)  # No Content


def save_chat_history(chat_id, chat):
    pass


class PlaylistHandler(CorsHandler):
    def initialize(self):
        pass

    def post(self):
        try:
            seed = json.loads(self.request.body)
            # temperature is normalized to 0-1.5
            # 2 is too hot, gpt35 breaks
            # temperature = req_body["temperature"] * 3 / 4
            temperature = 0.1
        except ValueError:
            server_log.error('Invalid JSON data')
            self.set_status(400)
            self.write('Invalid chat data')
            return

        try:
            instructions = f"Given the user's playlists, produce a new playlist. The playlist should not exceed the length of {seed['length']} {seed['length_unit']}. {".".join(seed['instructions'])} Reply only the JSON with songs' structures {{name, artist}}.\n\n---SEED PLAYLISTS:\n"
            instructions += "\n".join([",".join([j['artist'] + ' - ' + j['name'] for j in i]) for i in seed['playlists']])
            instructions += "--- FAVORITE SONGS" + ",".join([j['artist'] + ' - ' + j['name'] for j in seed['favorites']]) + "\n"
            chatgpt_model_name = os.getenv('CHAT_MODEL') or 'gpt-4o'
            chat_log.info(instructions)

            response = client.chat.completions.create(
                model=chatgpt_model_name,
                messages=[
                    {'role': "user", 'content': instructions}
                ],
                temperature=temperature,
                stream=True
            )

            self.set_header('Content-Type', 'text/event-stream;charset=utf-8')
            self.set_header('Cache-Control', 'no-cache')

            content = ''
            for chunk in response:
                if chunk.choices[0].delta.content:
                    piece = chunk.choices[0].delta.content
                    content += piece

            reply = json.loads('\n'.join(content.split('\n')[1:-1]))
            self.write({'songs': reply})
#             json_songs = """
#             {
#     "songs": [
#         {
#             "name": "Sunshine of Your Love",
#             "artist": "Cream"
#         },
#         {
#             "name": "L.A. Woman",
#             "artist": "The Doors"
#         },
#         {
#             "name": "White Room",
#             "artist": "Cream"
#         },
#         {
#             "name": "Rebel Rebel",
#             "artist": "David Bowie"
#         },
#         {
#             "name": "Baba O'Riley",
#             "artist": "The Who"
#         },
#         {
#             "name": "Paint It Black",
#             "artist": "The Rolling Stones"
#         },
#         {
#             "name": "Light My Fire",
#             "artist": "The Doors"
#         },
#         {
#             "name": "All Along the Watchtower",
#             "artist": "The Jimi Hendrix Experience"
#         },
#         {
#             "name": "Lola",
#             "artist": "The Kinks"
#         },
#         {
#             "name": "Go Your Own Way",
#             "artist": "Fleetwood Mac"
#         },
#         {
#             "name": "Space Oddity",
#             "artist": "David Bowie"
#         }
#     ]
# }
# """
# self.write(json_songs)

        except Exception as e:
            server_log.error(e)
            self.set_status(500)
            self.write('Internal error')
