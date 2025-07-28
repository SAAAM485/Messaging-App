import React from 'react';
import styles from './CompositeAvatar.module.css';
import type { UserPreview } from '../../../types/models';

type Props = {
  users: UserPreview[];
  size?: number;
};

const CompositeAvatar = ({ users, size = 48 }: Props) => {
  const avatarSize = size / 2;

  return (
    <div
      className={styles.compositeAvatar}
      style={{
        width: size,
        height: size,
      }}
    >
      {users.slice(0, 4).map((user, index) => (
        <img
          key={user.id || index}
          src={user.image || '/logo.png'}
          alt={user.name || 'User Avatar'}
          className={`${styles.avatar} ${styles[`avatar${index + 1}`]}`}
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
        />
      ))}
    </div>
  );
};

export default CompositeAvatar;
