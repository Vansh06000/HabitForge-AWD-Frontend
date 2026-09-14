const habitForm = document.getElementById("habitForm");
const habitsContainer = document.getElementById("habitsContainer");

const habitNameInput = document.getElementById("habitName");
const habitCategoryInput = document.getElementById("habitCategory");
const habitFrequencyInput = document.getElementById("habitFrequency");
const habitTargetInput = document.getElementById("habitTarget");

const API_URL = "https://habitforge-server-k8gd.onrender.com";


// ===============================
// ADD HABIT
// ===============================

habitForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const habitName = habitNameInput.value.trim();
    const habitCategory = habitCategoryInput.value;
    const habitFrequency = habitFrequencyInput.value;
    const habitTarget = habitTargetInput.value;

    if (!habitName || !habitCategory || !habitFrequency || !habitTarget) {
        alert("Please fill all fields.");
        return;
    }

    const user = JSON.parse(
        localStorage.getItem("habitforgeUser")
    );

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const habitData = {
        name: habitName,
        category: habitCategory,
        frequency: habitFrequency,
        target: Number(habitTarget),
        userId: user._id
    };

    try {

        const response = await fetch(
            `${API_URL}/api/habits`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(habitData)
            }
        );

        const result = await response.json();

        console.log(result);

        if (!response.ok) {

            alert(
                result.message ||
                "Failed to save habit."
            );

            return;
        }

        alert("Habit added successfully!");

        habitForm.reset();

        const modalElement =
            document.getElementById("addHabitModal");

        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }
        }

        loadHabits();

    } catch (error) {

        console.error(
            "Error adding habit:",
            error
        );

        alert(
            "Could not connect to the server."
        );
    }
});


// ===============================
// LOAD HABITS
// ===============================

async function loadHabits() {

    const user = JSON.parse(
        localStorage.getItem("habitforgeUser")
    );

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/habits/${user._id}`
        );

        const habits = await response.json();

        habitsContainer.innerHTML = "";

        if (!habits || habits.length === 0) {

            habitsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No habits added yet.</p>
                </div>
            `;

            return;
        }

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        habits.forEach(function (habit) {

            const habitName =
                habit.name ||
                habit.habitName ||
                "Unnamed Habit";

            const habitCategory =
                habit.category ||
                "General";

            const habitFrequency =
                habit.frequency ||
                "Daily";

            const habitTarget =
                habit.target ?? 0;

            const isCompleted =
                habit.completedDates &&
                habit.completedDates.includes(today);

            const habitCard =
                document.createElement("div");

            habitCard.className =
                "habit-card";

            habitCard.innerHTML = `

                <div class="habit-card-icon">
                    <i class="bi bi-check2-circle"></i>
                </div>

                <div class="habit-card-content">

                    <h4>${habitName}</h4>

                    <p>
                        ${habitCategory}
                        • ${habitFrequency}
                        • Target: ${habitTarget}
                    </p>

                </div>

                <button
                    class="habit-complete-btn ${isCompleted ? "completed" : ""}"
                    data-id="${habit._id}">

                    <i class="bi bi-check-lg"></i>

                </button>
            `;

            habitsContainer.appendChild(
                habitCard
            );

        });

    } catch (error) {

        console.error(
            "Error loading habits:",
            error
        );

        habitsContainer.innerHTML = `
            <div class="empty-state">
                <p>Could not load habits.</p>
            </div>
        `;
    }
}


// ===============================
// COMPLETE / UNCOMPLETE HABIT
// ===============================

habitsContainer.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".habit-complete-btn"
            );

        if (!button) {
            return;
        }

        const habitId =
            button.dataset.id;

        try {

            const response =
                await fetch(
                    `${API_URL}/api/habits/${habitId}/complete`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            const result =
                await response.json();

            console.log(result);

            if (!response.ok) {

                alert(
                    result.message ||
                    "Failed to update habit."
                );

                return;
            }

            loadHabits();

        } catch (error) {

            console.error(
                "Error completing habit:",
                error
            );

            alert(
                "Could not connect to the server."
            );
        }

    }
);


// ===============================
// INITIAL LOAD
// ===============================

loadHabits();
