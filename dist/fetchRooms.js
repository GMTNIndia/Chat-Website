document.addEventListener('DOMContentLoaded', () => {
  const roomSection = document.getElementById('roomSection');
  const roomsContainer = document.getElementById('roomsContainer');

  const token = localStorage.getItem("token");

  const requestOptions = {
    headers: {
      'Authorization': `${token}`,
    },
  };

  fetch('http://127.0.0.1:8000/api/rooms/', requestOptions)
    .then(response => response.json())
    .then(data => {
      data.forEach(room => {
        // Fetch messages for the room
        fetch(`http://127.0.0.1:8000/api/messages/${room.room_id}/`, requestOptions)
          .then(response => response.json())
          .then(messages => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'bg-[#D8F2E4] p-4 rounded-lg';

            roomDiv.innerHTML = `
              <h2 class="text-2xl font-semibold mb-2 text-black">Chat</h2>
              <div class="pb-2">
                <div class="border-green-300 px-2">
                  <p><strong>ID:</strong> ${room.room_id}</p>
                  <p><strong>Name:</strong> ${room.user_name}</p>
                  <p><strong>Status:</strong> ${room.room_status}</p>
                  <p><strong>Agent:</strong> ${room.agent ? room.agent : 'None Yet...'}</p>
                </div>
                <div class="flex mt-4">
                  ${messages.length === 0 ? `
                    <button class="join-btn bg-[#285D46] text-white px-4 py-2 rounded-md mr-2" data-room-id="${room.room_id}" data-room-status="${room.room_status}">Join</button>
                  ` : `
                    <button class="review-btn bg-[#FCD34D] text-white px-4 py-2 rounded-md mr-2" data-room-id="${room.room_id}">Review</button>
                  `}
                  <button class="delete-btn bg-[#E3343F] text-white px-4 py-2 rounded-md">Delete</button>
                </div>
              </div>
            `;

            roomsContainer.appendChild(roomDiv);

            // Add event listener for delete button
            roomDiv.querySelector('.delete-btn').addEventListener('click', () => {
              // Remove the room section from the DOM
              roomDiv.remove();
              // Here you can also add logic to delete the room from the server if required
            });

            

            document.querySelectorAll('.join-btn').forEach(button => {
              button.addEventListener('click', (event) => {
                const room_Id = event.target.getAttribute('data-room-id');
                const roomStatus = event.target.getAttribute('data-room-status');
                const agentName = 'Manish'; // Replace with the actual agent name

                fetch(`http://127.0.0.1:8000/api/rooms/${room_Id}/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ agent: agentName }),
                })
                .then(response => response.json())
                .then(() => {
                  window.location.href = `./chat.html?room_id=${room_Id}`;
                })
                .catch(error => {
                  console.error('Error joining room:', error);
                });
              });
            });

            document.querySelectorAll('.review-btn').forEach(button => {
              button.addEventListener('click', (event) => {
                const roomId = event.target.getAttribute('data-room-id');
                window.location.href = `./chat.html?room_id=${roomId}`;
              });
            });
          })
          .catch(error => {
            console.error(`Error fetching messages for room ${room.room_id}:`, error);
          });
      });
    })
    .catch(error => {
      console.error('Error fetching rooms:', error);
    });
});
