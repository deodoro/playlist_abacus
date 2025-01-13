ssh deodoro.net "rm -rf ~/playlist_abacus"
npm run build
scp -r build deodoro.net:/home/deodoro/playlist_abacus
ssh deodoro.net "cp -r ~/playlist_abacus/* /var/www/playlist_abacus"

