import React from'react';
import { View ,Navigator} from '@tarojs/components';
import './index.scss';

interface NoteItemProps {
    item: {
        id: number;
        title: string;
        tags?: (string | null)[];
    };
}

const NoteItem: React.FC<NoteItemProps> = ({ item }) => {
    return (
        <View className="note-item">
          <Navigator url={`/pages/note-detail/index?id=${item.id}`}>
            <View className="note-title">{item.title}</View>
            {item.tags && item.tags.length > 0 && (
                <View className="note-tags">
                    {item.tags.map((tag, index) => (
                        <View
                            key={`${item.id}-${index}`}
                            className="tag"
                        >
                            {tag || '无标签'}
                        </View>
                    ))}

                </View>
            )}
            </Navigator>
        </View>
    );
};

export default NoteItem;
