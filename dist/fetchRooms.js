
document.addEventListener('DOMContentLoaded', () => {
  const roomSection = document.getElementById('roomSection');
  const roomsContainer = document.getElementById('roomsContainer');
  const token = localStorage.getItem("token");
  const agentId = localStorage.getItem("agent_id"); // Assuming agent_id is stored in localStorage

  const requestOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  fetch('http://127.0.0.1:8000/api/rooms/', requestOptions)
    .then(response => response.json())
    .then(data => {
      data.forEach(room => {
        fetch(`http://127.0.0.1:8000/api/messages/${room.room_id}/`, requestOptions)
          .then(response => response.json())
          .then(messages => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'bg-[#D8F2E4] p-4 rounded-lg';
            roomDiv.setAttribute('data-room-id', room.room_id);

            roomDiv.innerHTML = `
              <h2 class="text-2xl font-semibold mb-2 text-black">Chat</h2>
              <div class="pb-2">
                <div class="border-green-300 px-2">
                  <p><strong>ID:</strong> ${room.room_id}</p>
                  <p><strong>Name:</strong> ${room.user_name}</p>
                  <p><strong>Status:</strong> ${room.room_status}</p>
                </div>    
                <div class="flex mt-4">
                  ${messages.length === 0 ? `
                    <button class="join-btn bg-[#285D46] text-white px-4 py-2 rounded-md mr-2" data-room-id="${room.room_id}" data-room-status="${room.room_status}">Join</button>
                  ` : `
                    <button class="review-btn bg-[#FCD34D] text-white px-4 py-2 rounded-md mr-2" data-room-id="${room.room_id}">Review</button>
                  `}
                  <button class="delete-btn bg-[#E3343F] text-white px-4 py-2 rounded-md" data-room-id="${room.room_id}">Delete</button>
                </div>
              </div>
            `;

            roomsContainer.appendChild(roomDiv);

            document.querySelectorAll('.join-btn').forEach(button => {
              button.addEventListener('click', (event) => {
                const room_Id = event.target.getAttribute('data-room-id');
                const roomStatus = event.target.getAttribute('data-room-status');
                const agentName = localStorage.getItem("first_name");

                fetch(`http://127.0.0.1:8000/api/rooms/${room_Id}/join/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ agent_id: agentId }),
                })
                .then(response => response.json())
                .then(data => {
                  if (data.is_engaged === 'engaged') {
                    event.target.textContent = 'Engaged';
                    event.target.disabled = true;
                    window.location.href = `./chat.html?room_id=${room_Id}`;
                  }
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

            document.querySelectorAll('.delete-btn').forEach(button => {
              button.addEventListener('click', (event) => {
                const roomId = event.target.getAttribute('data-room-id');

                fetch(`http://127.0.0.1:8000/api/rooms/${roomId}/delete/`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    const roomElement = document.querySelector(`[data-room-id='${roomId}']`);
                    roomElement.remove();
                  } else {
                    console.error('Error deleting room:', data.error);
                  }
                })
                .catch(error => {
                  console.error('Error deleting room:', error);
                });
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