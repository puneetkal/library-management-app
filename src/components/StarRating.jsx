const StarRating = ({ rating, onRatingChange }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`text-2xl ${
                        star <= rating 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                    }`}
                    onClick={() => onRatingChange(star)}
                >
                    ★
                </button>
            ))}
        </div>
    )
}

export default StarRating
