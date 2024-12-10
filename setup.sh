git clone https://github.com/tezzary/AtarCalculator
cd AtarCalculator

sudo apt update

sudo apt install python3 python3-venv libaugeas0
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
sudo certbot certonly --standalone
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker

#https://mindsers.blog/en/post/https-using-nginx-certbot-docker/
#copy the nginx conf file

docker run -it --restart=always -d -p 80:80 --name web -v ~/AtarCalculator:/usr/share/nginx/html -v ~/AtarCalculator/nginx.conf:/etc/nginx/nginx.conf -v /etc/letsencrypt:/etc/letsencrypt:ro nginx
cp ~/AtarCalculator/* /usr/share/nginx/html/

sudo 