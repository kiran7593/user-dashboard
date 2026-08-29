type UserCardProps = {
    username: string
    email: string
}

function UserCard({ username, email }: UserCardProps) {
    return (
        <div>
            <h2>{username}</h2>
            <p>{email}</p>
        </div>
    )
}

export default UserCard