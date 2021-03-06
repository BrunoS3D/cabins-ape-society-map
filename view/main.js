let onViewModeChange = () => {};
      let onCoordChange = () => {};
      (async () => {
        const response = await fetch('assets.json');
        const assets = await response.json();

        const canvas = document.querySelector('#canvas');
        const ctx = canvas.getContext('2d');
        const body = document.querySelector('body');

        const roadSize = 2;
        const squareSize = 7;
        const mapWidth = 101;
        const mapHeight = 101;

        canvas.width = mapWidth * squareSize + mapWidth * roadSize + squareSize + roadSize;
        canvas.height = mapHeight * squareSize + mapHeight * roadSize + squareSize + roadSize;

        body.style.width = canvas.width * 2 + 'px';
        body.style.height = canvas.height * 2 + 'px';

        const sizeColors = {
          chateau: '#fbff00',
          estate: '#8a4021',
          cottage: '#3dad4c',
        };

        document.onload = (() => render('size'))();

        // bind function scope
        onViewModeChange = function (event) {
          const viewMode = event.target.value;
          const xCoordInput = document.querySelector('#xCoord');
          const yCoordInput = document.querySelector('#yCoord');
          render(viewMode, xCoordInput.value, yCoordInput.value);
          console.log(viewMode);
        };

        onCoordChange = function (event) {
          const viewModeEl = document.querySelector('#viewMode');
          const xCoordInput = document.querySelector('#xCoord');
          const yCoordInput = document.querySelector('#yCoord');
          const viewMode = viewModeEl.value;
          render(viewMode, xCoordInput.value, yCoordInput.value);
        };

        async function render(viewMode, highlightX, highlightY) {
          const colors = {};

          // clear
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // draw squares for each asset
          for (let x = 1; x <= mapWidth; x++) {
            for (let y = 1; y <= mapHeight; y++) {
              const coordX = x * squareSize + x * roadSize;
              const coordY = squareSize * mapHeight + roadSize * mapHeight + squareSize - roadSize - (y * squareSize + y * roadSize);

              const asset = assets[`${x},${y}`];

              if (!asset) continue;

              if (viewMode === 'size') {
                ctx.fillStyle = sizeColors[asset.traits['cabin size']];
              }

              // // rua
              if (viewMode === 'street') {
                ctx.fillStyle =
                  colors?.[asset.traits.street] ||
                  (colors[asset.traits.street] = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'));
              }

              // // district
              if (viewMode === 'district') {
                ctx.fillStyle =
                  colors?.[asset.traits.district] ||
                  (colors[asset.traits.district] = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'));
              }

              // // slvd rating
              if (viewMode === 'slvd rating') {
                // A-Z
                const slvdRating = asset.traits['slvd rating'].toUpperCase();
                const colorNumber = 16581375 - Math.floor(((slvdRating.charCodeAt(0) - 65) / 26) * 16581375);
                ctx.fillStyle = colors?.[slvdRating] || (colors[slvdRating] = `#${colorNumber.toString(16).padStart(6, '0')}`);
              }

              if (viewMode === 'buy now') {
                if (asset.listing_link) {
                  ctx.fillStyle = '#5ee7ff';
                } else {
                  ctx.fillStyle = '#333';
                }
              }

              // // slvd rating experimental
              if (viewMode === 'slvd rating experimental') {
                // A-Z
                const slvdRating = asset.traits['slvd rating'].toUpperCase();
                ctx.fillStyle = colors?.[slvdRating] || (colors[slvdRating] = lerpColor('#d35b53', '#83a771', (slvdRating.charCodeAt(0) - 65) / 26));
              }

              if (viewMode === 'near landmarks') {
                if (
                  asset.listing_link &&
                  x !== 1 &&
                  y !== 1 &&
                  x !== mapWidth &&
                  y !== mapHeight &&
                  (!assets[`${x + 1},${y}`] ||
                    !assets[`${x - 1},${y}`] ||
                    !assets[`${x},${y + 1}`] ||
                    !assets[`${x},${y - 1}`] ||
                    !assets[`${x + 1},${y + 1}`] ||
                    !assets[`${x - 1},${y - 1}`] ||
                    !assets[`${x + 1},${y - 1}`] ||
                    !assets[`${x - 1},${y + 1}`])
                ) {
                  ctx.fillStyle = '#5ee7ff';
                } else {
                  ctx.fillStyle = '#333';
                }
              }

              if (highlightX == x && highlightY == y) {
                setTimeout(() => {
                  ctx.beginPath();
                  ctx.lineWidth = 5;
                  ctx.strokeStyle = 'red';
                  ctx.arc(coordX + squareSize / 2, coordY + squareSize / 2, squareSize * 2, 0, 2 * Math.PI);
                  ctx.stroke();
                }, 5);

                ctx.fillStyle = 'red';
              }

              // if ((asset.traits['slvd rating'] !== 'a' && asset.traits['slvd rating'] !== 'b') || !asset.listing_price || asset.listing_price > 8000) {
              //   ctx.fillStyle = '#333';
              // }

              // if (x > 90 && x < 100 && y === 66) {
              //   console.log(asset);
              //   ctx.fillStyle = 'red';
              // }

              // if (x === 43 && y === 9) {
              //   ctx.fillStyle = 'red';
              // }

              // if (asset.listing_price && asset.listing_price < 500) {
              //   ctx.fillStyle = 'red';
              // }

              // if (asset.traits.street === 'wright avenue') {
              //   ctx.fillStyle = 'red';
              // }

              // if (viewMode === 'test') {
              //   const img = new Image();
              //   img.src = asset.image;
              //   // img.src = 'https://service.cnftpredator.tools/ipfs/Qmf5phJASknAMAkLFy85Po4QkiGifEm7YJrFzViuTM6rma';
              //   img.onload = () => {
              //     ctx.drawImage(img, coordX, coordY, squareSize, squareSize);
              //   };
              // } else {
              ctx.fillRect(coordX, coordY, squareSize, squareSize);
              // }
            }
          }
        }

        function lerpColor(a, b, amount) {
          var ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16,
            ag = (ah >> 8) & 0xff,
            ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16,
            bg = (bh >> 8) & 0xff,
            bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

          return '#' + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1);
        }

        const divPopover = document.querySelector('#popover');
        const pStreetName = document.querySelector('#name');
        const pCabinCoord = document.querySelector('#coord');
        const pCabinInfo = document.querySelector('#info');

        function getCursorPosition(canvas, event) {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          divPopover.style.top = `${rect.top + y + 5}px`;
          divPopover.style.left = `${rect.left + x + 5}px`;

          const relativeX = Math.floor(x / (squareSize + roadSize));
          const relativeY = Math.floor((squareSize * mapHeight + roadSize * mapHeight + squareSize * 2 - y) / (squareSize + roadSize));

          const asset = assets[`${relativeX},${relativeY}`];

          canvas.style.cursor = 'default';

          if (!asset) return null;

          pStreetName.innerText = `street: ${asset.traits.street} / price: ${asset.listing_price || 0}`;
          pCabinCoord.innerText = `coord (X,Y): ${relativeX},${relativeY}`;
          pCabinInfo.innerText = `size: ${asset.traits['cabin size']} / district: ${asset.traits.district} / slvd rating: ${asset.traits['slvd rating']}`;

          if (asset.listing_link) {
            canvas.style.cursor = 'pointer';
          }

          return asset;
        }

        canvas.addEventListener('mousemove', function (e) {
          getCursorPosition(canvas, e);
        });

        function openInNewTab(url) {
          window.open(url, '_blank').focus();
        }

        canvas.addEventListener('mousedown', function (e) {
          const asset = getCursorPosition(canvas, e);

          if (!asset) return;

          if (asset.listing_link) {
            openInNewTab(asset.listing_link);
          }
        });

        // for (const [street, color] of Object.entries(colors)) {
        //   const node = document.createElement('a');

        //   a.attribut;
        //   node.innerText = street;
        //   //   node.style.color = color;

        //   divStreets.appendChild(node);
        // }
      })();