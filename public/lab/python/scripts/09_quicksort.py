# 快速排序

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    else:
        pivot = arr[0]
        less_than_pivot = [i for i in arr[1:] if i <= pivot]
        great_than_pivot = [i for i in arr[1:] if i > pivot]
        return quick_sort(less_than_pivot) + [pivot] + quick_sort(great_than_pivot)
    

# 示例使用

if __name__ == '__main__':
    sample_array = [3, 7, 1, 9, 2, 5]
    sorted_array = quick_sort(sample_array)
    print("原数组", sample_array)
    print("排序后的数组", sorted_array)

