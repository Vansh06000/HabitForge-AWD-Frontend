// ======================================================
// LOGIN PROTECTION
// ======================================================

const userId =
    localStorage.getItem("userId");

if (!userId) {

    window.location.href =
        "login.html";

}


// ======================================================
// API URL
// ======================================================

const API_URL = "https://habitforge-awd.onrender.com";

// ======================================================
// GET ELEMENTS
// ======================================================

const habitForm =
    document.getElementById("habitForm");

const habitsContainer =
    document.getElementById("habitsContainer");

const logoutBtn =
    document.getElementById("logoutBtn");

const goalsContainer =
    document.getElementById("goalsContainer");


// ======================================================
// ADD HABIT
// ======================================================

habitForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const habitName =
            document
                .getElementById("habitName")
                .value
                .trim();


        const habitCategory =
            document
                .getElementById("habitCategory")
                .value;


        const habitFrequency =
            document
                .getElementById("habitFrequency")
                .value;


        const habitTarget =
            document
                .getElementById("habitTarget")
                .value;


        const habitUnit =
            document
                .getElementById("habitUnit")
                .value;


        if (
            habitName === "" ||
            habitCategory === "Select Category" ||
            habitTarget === ""
        ) {

            alert(
                "Please fill all required fields."
            );

            return;

        }


        const habitData = {

            userId: userId,

            name: habitName,

            category: habitCategory,

            frequency: habitFrequency,

            target: Number(habitTarget),

            unit: habitUnit

        };


        try {

            const response =
                await fetch(
                    `${API_URL}/api/habits`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                habitData
                            )

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to save habit"
                );

            }


            await loadHabits();

            await loadActivities();


            const modalElement =
                document.getElementById(
                    "addHabitModal"
                );


            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {
                modal.hide();
            }


            habitForm.reset();


        } catch (error) {

            console.error(
                "Error saving habit:",
                error
            );

            alert(
                "Could not save habit. Please check that the API server is running."
            );

        }

    }
);


// ======================================================
// LOAD HABITS
// ======================================================

async function loadHabits() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/habits?userId=${encodeURIComponent(userId)}`
            );


        const habits =
            await response.json();


        if (!response.ok) {

            throw new Error(
                habits.message ||
                "Failed to load habits"
            );

        }


        updateDashboardStats(
            habits
        );


        habitsContainer.innerHTML =
            "";


        if (habits.length === 0) {

            habitsContainer.innerHTML = `

                <div>

                    <div class="empty-icon">
                        <i class="bi bi-inbox"></i>
                    </div>

                    <div class="empty-title">
                        No habits yet.
                    </div>

                    <p class="empty-text">
                        Click "Add Habit" to create your first habit.
                    </p>

                </div>

            `;

            return;

        }


        habits.forEach(
            function (habit) {

                const habitCard =
                    document.createElement(
                        "div"
                    );


                habitCard.className =
                    "habit-card";


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


                const habitUnit =
                    habit.unit ||
                    "Times";


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                const isCompleted =
                    habit.completedDates &&
                    habit.completedDates
                        .includes(today);


                habitCard.innerHTML = `

                    <div class="habit-card-icon">

                        <i class="bi bi-check-circle"></i>

                    </div>


                    <div class="habit-card-content">

                        <h3>
                            ${habitName}
                        </h3>

                        <p>

                            <span>
                                ${habitCategory}
                            </span>

                            •

                            ${habitFrequency}

                            •

                            Target:
                            ${habitTarget}
                            ${habitUnit}

                        </p>

                    </div>


                    <div class="habit-actions">

                        <button
                            class="habit-edit-btn"
                            data-id="${habit._id}">

                            <i class="bi bi-pencil"></i>
                            Edit

                        </button>


                        <button
                            class="habit-delete-btn"
                            data-id="${habit._id}">

                            <i class="bi bi-trash"></i>
                            Delete

                        </button>


                        <button
                            class="habit-complete-btn ${isCompleted ? "completed" : ""}"
                            data-id="${habit._id}">

                            <i class="bi bi-check-lg"></i>

                        </button>

                    </div>

                `;


                habitsContainer.appendChild(
                    habitCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading habits:",
            error
        );

    }

}


// ======================================================
// HABIT BUTTONS
// ======================================================

habitsContainer.addEventListener(
    "click",
    async function (event) {


        // COMPLETE

        const completeButton =
            event.target.closest(
                ".habit-complete-btn"
            );


        if (completeButton) {

            const habitId =
                completeButton.dataset.id;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/habits/${habitId}/complete`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    userId:
                                        userId
                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message
                    );

                }


                await loadHabits();

                await loadActivities();


            } catch (error) {

                console.error(error);

                alert(
                    "Could not update habit."
                );

            }


            return;

        }


        // EDIT

        const editButton =
            event.target.closest(
                ".habit-edit-btn"
            );


        if (editButton) {

            await openEditHabit(
                editButton.dataset.id
            );

            return;

        }


        // DELETE

        const deleteButton =
            event.target.closest(
                ".habit-delete-btn"
            );


        if (deleteButton) {

            await deleteHabit(
                deleteButton.dataset.id
            );

            return;

        }

    }
);


// ======================================================
// OPEN EDIT HABIT
// ======================================================

async function openEditHabit(
    habitId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/habits?userId=${encodeURIComponent(userId)}`
            );


        const habits =
            await response.json();


        const habit =
            habits.find(
                h => h._id === habitId
            );


        if (!habit) {

            alert(
                "Habit not found."
            );

            return;

        }


        document.getElementById(
            "editHabitId"
        ).value = habit._id;


        document.getElementById(
            "editHabitName"
        ).value =
            habit.name ||
            habit.habitName ||
            "";


        document.getElementById(
            "editHabitCategory"
        ).value =
            habit.category ||
            "Study";


        document.getElementById(
            "editHabitFrequency"
        ).value =
            habit.frequency ||
            "Daily";


        document.getElementById(
            "editHabitTarget"
        ).value =
            habit.target ?? "";


        document.getElementById(
            "editHabitUnit"
        ).value =
            habit.unit ||
            "Times";


        const modalElement =
            document.getElementById(
                "editHabitModal"
            );


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();


    } catch (error) {

        console.error(
            "Error opening edit modal:",
            error
        );

        alert(
            "Could not load habit details."
        );

    }

}


// ======================================================
// UPDATE HABIT
// ======================================================

const editHabitForm =
    document.getElementById(
        "editHabitForm"
    );


editHabitForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const habitId =
            document.getElementById(
                "editHabitId"
            ).value;


        const updatedHabit = {

            userId: userId,

            name:
                document.getElementById(
                    "editHabitName"
                ).value.trim(),

            category:
                document.getElementById(
                    "editHabitCategory"
                ).value,

            frequency:
                document.getElementById(
                    "editHabitFrequency"
                ).value,

            target:
                Number(
                    document.getElementById(
                        "editHabitTarget"
                    ).value
                ),

            unit:
                document.getElementById(
                    "editHabitUnit"
                ).value

        };


        if (
            updatedHabit.name === "" ||
            !updatedHabit.target
        ) {

            alert(
                "Please fill all required fields."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/habits/${habitId}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                updatedHabit
                            )

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message
                );

            }


            const modalElement =
                document.getElementById(
                    "editHabitModal"
                );


            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {
                modal.hide();
            }


            await loadHabits();

            await loadActivities();


        } catch (error) {

            console.error(
                "Error updating habit:",
                error
            );

            alert(
                "Could not update habit."
            );

        }

    }
);


// ======================================================
// DELETE HABIT
// ======================================================

async function deleteHabit(
    habitId
) {

    if (
        !confirm(
            "Are you sure you want to delete this habit?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/habits/${habitId}?userId=${encodeURIComponent(userId)}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message
            );

        }


        await loadHabits();

        await loadActivities();


    } catch (error) {

        console.error(
            "Error deleting habit:",
            error
        );

        alert(
            "Could not delete habit."
        );

    }

}


// ======================================================
// DASHBOARD STATISTICS
// ======================================================

function updateDashboardStats(
    habits
) {

    const totalHabits =
        habits.length;


    document.getElementById(
        "totalHabits"
    ).textContent =
        totalHabits;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    let completedTodayCount =
        0;


    habits.forEach(
        function (habit) {

            if (
                habit.completedDates &&
                habit.completedDates.includes(
                    today
                )
            ) {

                completedTodayCount++;

            }

        }
    );


    document.getElementById(
        "completedToday"
    ).textContent =
        completedTodayCount;


    let successRate = 0;


    if (totalHabits > 0) {

        successRate =
            Math.round(
                (
                    completedTodayCount /
                    totalHabits
                ) * 100
            );

    }


    document.getElementById(
        "successRate"
    ).textContent =
        successRate + "%";


    const completedDates =
        new Set();


    habits.forEach(
        function (habit) {

            if (
                habit.completedDates
            ) {

                habit.completedDates.forEach(
                    function (date) {

                        completedDates.add(
                            date
                        );

                    }
                );

            }

        }
    );


    let currentStreak =
        0;


    let checkDate =
        new Date();


    while (true) {

        const dateString =
            checkDate
                .toISOString()
                .split("T")[0];


        if (
            !completedDates.has(
                dateString
            )
        ) {

            break;

        }


        currentStreak++;


        checkDate.setDate(
            checkDate.getDate() - 1
        );

    }


    document.getElementById(
        "currentStreak"
    ).textContent =
        currentStreak;

}


// ======================================================
// CREATE GOAL
// ======================================================

const goalForm =
    document.getElementById(
        "goalForm"
    );


goalForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const goalData = {

            userId: userId,

            name:
                document.getElementById(
                    "goalName"
                ).value.trim(),

            target:
                Number(
                    document.getElementById(
                        "goalTarget"
                    ).value
                ),

            unit:
                document.getElementById(
                    "goalUnit"
                ).value,

            deadline:
                document.getElementById(
                    "goalDeadline"
                ).value ||
                null

        };


        if (
            goalData.name === "" ||
            goalData.target <= 0
        ) {

            alert(
                "Please fill all required goal fields."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/goals`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                goalData
                            )

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message
                );

            }


            goalForm.reset();


            const modalElement =
                document.getElementById(
                    "addGoalModal"
                );


            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {
                modal.hide();
            }


            await loadGoals();

            await loadActivities();


        } catch (error) {

            console.error(
                "Error creating goal:",
                error
            );

            alert(
                "Could not create goal."
            );

        }

    }
);


// ======================================================
// LOAD GOALS
// ======================================================

async function loadGoals() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/goals?userId=${encodeURIComponent(userId)}`
            );


        const goals =
            await response.json();


        if (!response.ok) {

            throw new Error(
                goals.message
            );

        }


        goalsContainer.innerHTML =
            "";


        if (goals.length === 0) {

            goalsContainer.innerHTML = `

                <div class="goal-empty-state">

                    <div class="empty-icon">

                        <i class="bi bi-bullseye"></i>

                    </div>

                    <div class="empty-title">
                        No goals yet.
                    </div>

                    <p class="empty-text">
                        Click "Add Goal" to create your first goal.
                    </p>

                </div>

            `;

            return;

        }


        goals.forEach(
            function (goal) {

                const target =
                    Number(goal.target) ||
                    0;


                const progress =
                    Number(goal.progress) ||
                    0;


                let percentage = 0;


                if (target > 0) {

                    percentage =
                        Math.round(
                            (
                                progress /
                                target
                            ) * 100
                        );

                }


                percentage =
                    Math.min(
                        percentage,
                        100
                    );


                const goalCard =
                    document.createElement(
                        "div"
                    );


                goalCard.className =
                    "goal-card";


                goalCard.innerHTML = `

                    <div class="goal-card-icon">

                        <i class="bi bi-bullseye"></i>

                    </div>


                    <div class="goal-card-content">

                        <h3>
                            ${goal.name}
                        </h3>

                        <p>

                            Target:
                            ${target}
                            ${goal.unit}

                            ${
                                goal.deadline
                                ? ` • Deadline: ${goal.deadline}`
                                : ""
                            }

                        </p>

                    </div>


                    <div class="goal-progress-area">

                        <div class="goal-progress-text">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${progress}
                                /
                                ${target}
                                ${goal.unit}
                            </strong>

                        </div>


                        <div class="goal-progress-bar">

                            <div
                                class="goal-progress-fill"
                                style="width: ${percentage}%;">
                            </div>

                        </div>

                    </div>


                    <div class="goal-actions">

                        <button
                            type="button"
                            class="goal-progress-btn"
                            data-id="${goal._id}">

                            <i class="bi bi-plus-lg"></i>

                            Log Progress

                        </button>


                        <button
                            type="button"
                            class="goal-edit-btn"
                            data-id="${goal._id}">

                            <i class="bi bi-pencil"></i>

                            Edit

                        </button>


                        <button
                            type="button"
                            class="goal-delete-btn"
                            data-id="${goal._id}">

                            <i class="bi bi-trash"></i>

                            Delete

                        </button>

                    </div>

                `;


                goalsContainer.appendChild(
                    goalCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading goals:",
            error
        );

    }

}


// ======================================================
// GOAL BUTTONS
// ======================================================

goalsContainer.addEventListener(
    "click",
    async function (event) {


        const progressButton =
            event.target.closest(
                ".goal-progress-btn"
            );


        if (progressButton) {

            await openProgressModal(
                progressButton.dataset.id
            );

            return;

        }


        const editButton =
            event.target.closest(
                ".goal-edit-btn"
            );


        if (editButton) {

            await openEditGoal(
                editButton.dataset.id
            );

            return;

        }


        const deleteButton =
            event.target.closest(
                ".goal-delete-btn"
            );


        if (deleteButton) {

            await deleteGoal(
                deleteButton.dataset.id
            );

            return;

        }

    }
);


// ======================================================
// OPEN LOG PROGRESS MODAL
// ======================================================

async function openProgressModal(
    goalId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/goals?userId=${encodeURIComponent(userId)}`
            );


        const goals =
            await response.json();


        const goal =
            goals.find(
                g => g._id === goalId
            );


        if (!goal) {

            alert(
                "Goal not found."
            );

            return;

        }


        document.getElementById(
            "progressGoalId"
        ).value =
            goal._id;


        document.getElementById(
            "progressGoalName"
        ).textContent =
            goal.name;


        document.getElementById(
            "progressAmount"
        ).value =
            "";


        const modalElement =
            document.getElementById(
                "logProgressModal"
            );


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();


    } catch (error) {

        console.error(
            "Error opening progress modal:",
            error
        );

        alert(
            "Could not open progress form."
        );

    }

}


// ======================================================
// SUBMIT GOAL PROGRESS
// ======================================================

const progressForm =
    document.getElementById(
        "progressForm"
    );


progressForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const goalId =
            document.getElementById(
                "progressGoalId"
            ).value;


        const amount =
            Number(
                document.getElementById(
                    "progressAmount"
                ).value
            );


        if (
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please enter a valid progress amount."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/goals/${goalId}/progress`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                userId:
                                    userId,

                                amount:
                                    amount

                            })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message
                );

            }


            const modalElement =
                document.getElementById(
                    "logProgressModal"
                );


            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {
                modal.hide();
            }


            progressForm.reset();


            await loadGoals();

            await loadActivities();


        } catch (error) {

            console.error(
                "Error updating goal progress:",
                error
            );

            alert(
                "Could not update goal progress."
            );

        }

    }
);


// ======================================================
// OPEN EDIT GOAL
// ======================================================

async function openEditGoal(
    goalId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/goals?userId=${encodeURIComponent(userId)}`
            );


        const goals =
            await response.json();


        const goal =
            goals.find(
                g => g._id === goalId
            );


        if (!goal) {

            alert(
                "Goal not found."
            );

            return;

        }


        document.getElementById(
            "editGoalId"
        ).value =
            goal._id;


        document.getElementById(
            "editGoalName"
        ).value =
            goal.name || "";


        document.getElementById(
            "editGoalTarget"
        ).value =
            goal.target || "";


        document.getElementById(
            "editGoalUnit"
        ).value =
            goal.unit || "Times";


        document.getElementById(
            "editGoalDeadline"
        ).value =
            goal.deadline || "";


        const modalElement =
            document.getElementById(
                "editGoalModal"
            );


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();


    } catch (error) {

        console.error(
            "Error opening goal edit:",
            error
        );

        alert(
            "Could not load goal details."
        );

    }

}


// ======================================================
// UPDATE GOAL
// ======================================================

const editGoalForm =
    document.getElementById(
        "editGoalForm"
    );


editGoalForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const goalId =
            document.getElementById(
                "editGoalId"
            ).value;


        const goalData = {

            userId: userId,

            name:
                document.getElementById(
                    "editGoalName"
                ).value.trim(),

            target:
                Number(
                    document.getElementById(
                        "editGoalTarget"
                    ).value
                ),

            unit:
                document.getElementById(
                    "editGoalUnit"
                ).value,

            deadline:
                document.getElementById(
                    "editGoalDeadline"
                ).value ||
                null

        };


        if (
            goalData.name === "" ||
            goalData.target <= 0
        ) {

            alert(
                "Please fill all required fields."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/goals/${goalId}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                ...goalData,

                                progress: 0

                            })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message
                );

            }


            const modalElement =
                document.getElementById(
                    "editGoalModal"
                );


            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {
                modal.hide();
            }


            await loadGoals();

            await loadActivities();


        } catch (error) {

            console.error(
                "Error updating goal:",
                error
            );

            alert(
                "Could not update goal."
            );

        }

    }
);


// ======================================================
// DELETE GOAL
// ======================================================

async function deleteGoal(
    goalId
) {

    if (
        !confirm(
            "Are you sure you want to delete this goal?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/goals/${goalId}?userId=${encodeURIComponent(userId)}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message
            );

        }


        await loadGoals();

        await loadActivities();


    } catch (error) {

        console.error(
            "Error deleting goal:",
            error
        );

        alert(
            "Could not delete goal."
        );

    }

}


// ======================================================
// LOAD RECENT ACTIVITY
// ======================================================

async function loadActivities() {

    const activityContainer =
        document.getElementById(
            "activityContainer"
        );


    if (!activityContainer) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/activities?userId=${encodeURIComponent(userId)}`
            );


        const activities =
            await response.json();


        if (!response.ok) {

            throw new Error(
                activities.message ||
                "Failed to load activities"
            );

        }


        activityContainer.innerHTML =
            "";


        if (
            activities.length === 0
        ) {

            activityContainer.innerHTML = `

                <div class="activity-empty">

                    <i class="bi bi-clock-history"></i>

                    <p>
                        No recent activity yet.
                    </p>

                    <span>
                        Your actions will appear here.
                    </span>

                </div>

            `;

            return;

        }


        activities.forEach(
            function (activity) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "activity-item";


                let icon =
                    "bi-activity";


                if (
                    activity.type ===
                    "habit"
                ) {

                    icon =
                        "bi-check-circle";

                }


                if (
                    activity.type ===
                    "completion"
                ) {

                    icon =
                        "bi-check-circle-fill";

                }


                if (
                    activity.type ===
                    "goal"
                ) {

                    icon =
                        "bi-bullseye";

                }


                if (
                    activity.type ===
                    "progress"
                ) {

                    icon =
                        "bi-graph-up-arrow";

                }


                const activityDate =
                    new Date(
                        activity.createdAt
                    );


                const formattedTime =
                    activityDate.toLocaleString(
                        [],
                        {

                            dateStyle:
                                "medium",

                            timeStyle:
                                "short"

                        }
                    );


                item.innerHTML = `

                    <div class="activity-icon">

                        <i
                            class="bi ${icon}">
                        </i>

                    </div>


                    <div class="activity-content">

                        <div class="activity-message">

                            ${activity.message}

                        </div>


                        <div class="activity-time">

                            ${formattedTime}

                        </div>

                    </div>

                `;


                activityContainer.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading activities:",
            error
        );


        activityContainer.innerHTML = `

            <div class="activity-empty">

                <i class="bi bi-exclamation-circle"></i>

                <p>
                    Unable to load activity.
                </p>

            </div>

        `;

    }

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadHabits();

loadGoals();

loadActivities();


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "userId"
        );

        localStorage.removeItem(
            "userName"
        );

        localStorage.removeItem(
            "userEmail"
        );


        window.location.href =
            "login.html";

    }
);  