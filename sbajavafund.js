function getLearnerData(courseInfo, assignmentGroups, learnerSubmissions) {
    try {
      // Validate that assignment groups belong to the correct course
      for (const group of assignmentGroups) {
        if (group.course_id !== courseInfo.id) {
          throw new Error(`AssignmentGroup ID ${group.id} does not match Course ID ${courseInfo.id}`);
        }
      }
  
      // Store the current date to compare with assignment due dates
      const currentDate = new Date();
  
      // Helper function to calculate the average score
      function calculateWeightedAverage(learnerScores) {
        let totalScore = 0;
        let totalPointsPossible = 0;
  
        learnerScores.forEach(score => {
          totalScore += score;
          totalPointsPossible += 100; // Since each score is a percentage (out of 100)
        });
  
        return totalPointsPossible ? (totalScore / totalPointsPossible) * 100 : 0;
      }
  
      // Process each learner's submissions
      const learnersData = [];
      for (const submission of learnerSubmissions) {
        const learnerId = submission.learner_id;
        const assignmentId = submission.assignment_id;
        const learnerEntry = { id: learnerId };
        const scores = [];
  
        // Find the relevant assignment group and assignment
        let assignment, assignmentGroup;
        for (const group of assignmentGroups) {
          assignment = group.assignments.find(assign => assign.id === assignmentId);
          if (assignment) {
            assignmentGroup = group;
            break;
          }
        }
  
        // Skip if no matching assignment was found
        if (!assignment) continue;
  
        // Skip assignments that are not due yet
        if (new Date(assignment.due_at) > currentDate) continue;
  
        // Handle potential division by zero if points_possible is 0
        if (assignment.points_possible === 0) {
          console.warn(`Assignment ID ${assignment.id} has zero possible points, skipping.`);
          continue;
        }
  
        // Calculate the score for the assignment
        let scorePercentage = (submission.submission.score / assignment.points_possible) * 100;
  
        // Check if the submission was late and apply a 10% penalty if so
        if (new Date(submission.submission.submitted_at) > new Date(assignment.due_at)) {
          scorePercentage -= 10;
        }
  
        // Store the percentage score in the learner's entry
        learnerEntry[assignment.id] = scorePercentage;
  
        // Store the score for weighted average calculation
        scores.push(scorePercentage);
      }
  
      // Calculate and store the weighted average for the learner
      learnerEntry.avg = calculateWeightedAverage(scores);
      learnersData.push(learnerEntry);
  
      return learnersData;
    } catch (error) {
      console.error(`Error processing learner data: ${error.message}`);
      return [];
    }
  }
  
  // Sample data (for testing purposes)
  const courseInfo = {
    id: 1,
    name: "Web Development"
  };
  
  const assignmentGroups = [
    {
      id: 1,
      name: "Homework",
      course_id: 1,
      group_weight: 50,
      assignments: [
        {
          id: 1,
          name: "HTML Basics",
          due_at: "2024-09-10",
          points_possible: 100
        },
        {
          id: 2,
          name: "CSS Basics",
          due_at: "2024-09-20",
          points_possible: 100
        }
      ]
    }
  ];
  
  const learnerSubmissions = [
    {
      learner_id: 1,
      assignment_id: 1,
      submission: {
        submitted_at: "2024-09-09",
        score: 80
      }
    },
    {
      learner_id: 1,
      assignment_id: 2,
      submission: {
        submitted_at: "2024-09-21",
        score: 90
      }
    }
  ];
  
  // Run the function with sample data
  console.log(getLearnerData(courseInfo, assignmentGroups, learnerSubmissions));