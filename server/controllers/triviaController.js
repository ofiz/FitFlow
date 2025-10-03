const TriviaQuestion = require('../models/TriviaQuestion');
const TriviaScore = require('../models/TriviaScore');

// Get random question
exports.getRandomQuestion = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const count = await TriviaQuestion.countDocuments(query);
    
    if (count === 0) {
      return res.status(404).json({ message: 'No questions available' });
    }
    
    const random = Math.floor(Math.random() * count);
    const question = await TriviaQuestion.findOne(query).skip(random);
    
    res.json({
      id: question._id,
      question: question.question,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    
    if (!questionId || !selectedAnswer) {
      return res.status(400).json({
        message: 'Question ID and selected answer are required'
      });
    }
    
    const question = await TriviaQuestion.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Update user score
    let userScore = await TriviaScore.findOne({ userId: req.user.id });
    
    if (!userScore) {
      userScore = new TriviaScore({ userId: req.user.id });
    }
    
    userScore.totalAnswered += 1;
    
    if (isCorrect) {
      userScore.correctAnswers += 1;
      userScore.totalScore += 10; // 10 points per correct answer
      
      // Update streak
      const today = new Date().setHours(0, 0, 0, 0);
      const lastPlayed = userScore.lastPlayedDate 
        ? new Date(userScore.lastPlayedDate).setHours(0, 0, 0, 0)
        : null;
      
      if (!lastPlayed) {
        userScore.currentStreak = 1;
      } else {
        const daysDiff = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, streak continues
        } else if (daysDiff === 1) {
          // Next day, increment streak
          userScore.currentStreak += 1;
        } else {
          // Streak broken
          userScore.currentStreak = 1;
        }
      }
    } else {
      // Wrong answer doesn't break streak, but doesn't increase it
    }
    
    userScore.lastPlayedDate = new Date();
    await userScore.save();
    
    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      userScore: {
        totalScore: userScore.totalScore,
        totalAnswered: userScore.totalAnswered,
        correctAnswers: userScore.correctAnswers,
        currentStreak: userScore.currentStreak
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    let userScore = await TriviaScore.findOne({ userId: req.user.id });
    
    if (!userScore) {
      userScore = {
        totalScore: 0,
        totalAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0
      };
    }
    
    res.json(userScore);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed questions (for development)
exports.seedQuestions = async (req, res) => {
  try {
    const questions = [
      {
        question: "Which vitamin is known as the 'sunshine vitamin'?",
        options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
        correctAnswer: 'Vitamin D',
        category: 'vitamins',
        difficulty: 'easy',
        explanation: 'Vitamin D is called the sunshine vitamin because your body produces it when exposed to sunlight.'
      },
      {
        question: "What is the primary function of protein in the body?",
        options: ['Energy production', 'Building and repairing tissues', 'Vitamin storage', 'Blood clotting'],
        correctAnswer: 'Building and repairing tissues',
        category: 'macronutrients',
        difficulty: 'easy',
        explanation: 'Protein is essential for building and repairing tissues, making enzymes and hormones.'
      },
      {
        question: "How many calories are in one gram of fat?",
        options: ['4 calories', '7 calories', '9 calories', '12 calories'],
        correctAnswer: '9 calories',
        category: 'macronutrients',
        difficulty: 'medium',
        explanation: 'Fat contains 9 calories per gram, while carbohydrates and protein contain 4 calories per gram.'
      },
      {
        question: "Which mineral is most important for bone health?",
        options: ['Iron', 'Calcium', 'Zinc', 'Magnesium'],
        correctAnswer: 'Calcium',
        category: 'minerals',
        difficulty: 'easy',
        explanation: 'Calcium is crucial for building and maintaining strong bones and teeth.'
      },
      {
        question: "What percentage of the human body is water?",
        options: ['50%', '60%', '70%', '80%'],
        correctAnswer: '60%',
        category: 'hydration',
        difficulty: 'medium',
        explanation: 'The human body is approximately 60% water, varying by age and body composition.'
      },
      {
        question: "Which vitamin helps blood clot?",
        options: ['Vitamin A', 'Vitamin K', 'Vitamin E', 'Vitamin C'],
        correctAnswer: 'Vitamin K',
        category: 'vitamins',
        difficulty: 'medium',
        explanation: 'Vitamin K plays a key role in blood clotting and bone health.'
      },
      {
        question: "What is the recommended daily water intake for adults?",
        options: ['1-2 liters', '2-3 liters', '4-5 liters', '6-7 liters'],
        correctAnswer: '2-3 liters',
        category: 'hydration',
        difficulty: 'easy',
        explanation: 'Most adults need about 2-3 liters of water per day, depending on activity level and climate.'
      },
      {
        question: "Which macronutrient is the body's primary energy source?",
        options: ['Protein', 'Fat', 'Carbohydrates', 'Vitamins'],
        correctAnswer: 'Carbohydrates',
        category: 'macronutrients',
        difficulty: 'easy',
        explanation: 'Carbohydrates are the body\'s main and most efficient source of energy.'
      },
      {
        question: "Which vitamin is essential for vision?",
        options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
        correctAnswer: 'Vitamin A',
        category: 'vitamins',
        difficulty: 'easy',
        explanation: 'Vitamin A is crucial for maintaining healthy vision, especially in low light.'
      },
      {
        question: "What mineral helps transport oxygen in the blood?",
        options: ['Calcium', 'Iron', 'Potassium', 'Sodium'],
        correctAnswer: 'Iron',
        category: 'minerals',
        difficulty: 'medium',
        explanation: 'Iron is a key component of hemoglobin, which carries oxygen in red blood cells.'
      },
      {
        question: "How many essential amino acids does the body need?",
        options: ['5', '7', '9', '12'],
        correctAnswer: '9',
        category: 'macronutrients',
        difficulty: 'hard',
        explanation: 'There are 9 essential amino acids that the body cannot produce and must obtain from food.'
      },
      {
        question: "Which vitamin helps the body absorb calcium?",
        options: ['Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K'],
        correctAnswer: 'Vitamin D',
        category: 'vitamins',
        difficulty: 'medium',
        explanation: 'Vitamin D is essential for calcium absorption and bone health.'
      },
      {
        question: "What is the main source of omega-3 fatty acids?",
        options: ['Red meat', 'Dairy products', 'Fish', 'Grains'],
        correctAnswer: 'Fish',
        category: 'macronutrients',
        difficulty: 'easy',
        explanation: 'Fatty fish like salmon, mackerel, and sardines are excellent sources of omega-3 fatty acids.'
      },
      {
        question: "Which vitamin is also known as ascorbic acid?",
        options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin E'],
        correctAnswer: 'Vitamin C',
        category: 'vitamins',
        difficulty: 'medium',
        explanation: 'Vitamin C (ascorbic acid) is important for immune function and collagen production.'
      },
      {
        question: "What is the recommended daily fiber intake for adults?",
        options: ['10-15 grams', '25-30 grams', '40-45 grams', '50-55 grams'],
        correctAnswer: '25-30 grams',
        category: 'general',
        difficulty: 'medium',
        explanation: 'Most adults should aim for 25-30 grams of fiber daily for optimal digestive health.'
      },
      {
        question: "Which mineral helps regulate fluid balance?",
        options: ['Iron', 'Calcium', 'Potassium', 'Zinc'],
        correctAnswer: 'Potassium',
        category: 'minerals',
        difficulty: 'medium',
        explanation: 'Potassium helps maintain proper fluid balance and supports heart and muscle function.'
      },
      {
        question: "What percentage of daily calories should come from carbohydrates?",
        options: ['20-30%', '30-40%', '45-65%', '70-80%'],
        correctAnswer: '45-65%',
        category: 'macronutrients',
        difficulty: 'hard',
        explanation: 'Health guidelines recommend 45-65% of daily calories come from carbohydrates.'
      },
      {
        question: "Which vitamin is fat-soluble?",
        options: ['Vitamin B', 'Vitamin C', 'Vitamin E', 'All vitamins'],
        correctAnswer: 'Vitamin E',
        category: 'vitamins',
        difficulty: 'medium',
        explanation: 'Vitamins A, D, E, and K are fat-soluble, while B vitamins and C are water-soluble.'
      },
      {
        question: "What is the main function of antioxidants?",
        options: ['Build muscle', 'Protect cells from damage', 'Produce energy', 'Store fat'],
        correctAnswer: 'Protect cells from damage',
        category: 'general',
        difficulty: 'easy',
        explanation: 'Antioxidants help protect cells from damage caused by free radicals.'
      },
      {
        question: "Which nutrient is most important for muscle recovery?",
        options: ['Carbohydrates', 'Protein', 'Fat', 'Fiber'],
        correctAnswer: 'Protein',
        category: 'macronutrients',
        difficulty: 'easy',
        explanation: 'Protein is essential for repairing and building muscle tissue after exercise.'
      }
    ];
    
    await TriviaQuestion.deleteMany({}); // Clear existing
    await TriviaQuestion.insertMany(questions);
    
    res.json({ message: `${questions.length} questions seeded successfully` });
  } catch (error) {
    console.error('Error seeding questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};