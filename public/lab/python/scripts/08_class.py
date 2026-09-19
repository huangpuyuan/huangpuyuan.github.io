"""面向对象：类、继承、类属性与私有属性

原笔记里的 class.py 把 `class Dog` 定义了三次，后两次把前一次覆盖掉了：
  - 第 1 段（实例属性 + 类属性 + 修改类属性）
  - 第 2 段（@classmethod + @staticmethod）
  - 第 3 段（私有属性 __name）
三个定义同名，Python 依次执行，第二个 Dog 替换掉第一个，第三个又替换掉第二个。
结果是前两段写的类在后续代码里已经不存在了 —— 下面 Puppy 继承的其实是第 2 段的 Dog，
而第 3 段的 Dog 又把它顶掉，导致 `species`、`bark_sound` 全部消失。

这里改成三个不同类名的递进结构，每一段都能独立生效、互不覆盖。
"""

# ── 第一段：最基础的类 ─────────────────────────────────────
# 类属性（species）属于类本身，所有实例共享；
# 实例属性（name / age）在 __init__ 里绑定，每个对象各有一份。
class Dog:
    species = "Canis familiaris"          # 类属性，Dog 的所有实例共享

    def __init__(self, name, age):
        self.name = name                  # 实例属性
        self.age = age

    def bark(self):                       # 实例方法，第一个参数是 self
        return f"{self.name} says woof!"


my_dog = Dog("Buddy", 3)
print(my_dog.name)                        # Buddy
print(my_dog.age)                         # 3
print(my_dog.bark())                      # Buddy says woof!
print(Dog.species)                        # Canis familiaris

# 修改类属性：注意改的是「类上」的那一份，所有实例立即可见
Dog.species = "Canis lupus familiaris"
print(my_dog.species)                     # Canis lupus familiaris


# ── 第二段：类方法与静态方法 ───────────────────────────────
# @classmethod 第一个参数是 cls（类本身），能访问类属性；
# @staticmethod 不接收 self / cls，就是挂在类命名空间下的普通函数。
# 用不同的类名 TrainedDog，避免覆盖上面的 Dog。
class TrainedDog:
    species = "Canis familiaris"

    def __init__(self, name, age):
        self.name = name
        self.age = age

    @classmethod
    def get_species(cls):
        return cls.species

    @staticmethod
    def bark_sound():
        return "Woof!"


print(TrainedDog.get_species())           # Canis familiaris
print(TrainedDog.bark_sound())            # Woof!


# ── 第三段：继承与方法重写 ─────────────────────────────────
# Puppy 继承 Dog（就是第一段那个），super().__init__ 复用父类初始化，
# 然后重写 bark()，加上自己的 training_level。
class Puppy(Dog):
    def __init__(self, name, age, training_level):
        super().__init__(name, age)       # 复用父类 __init__
        self.training_level = training_level

    def bark(self):                       # 方法重写：同名方法覆盖父类版本
        return f"{self.name} says woof! (Training level: {self.training_level})"


my_puppy = Puppy("Max", 1, "Beginner")
print(my_puppy.bark())                    # Max says woof! (Training level: Beginner)
print(my_puppy.species)                   # Canis lupus familiaris —— 继承来的类属性


# ── 第四段：私有属性 ───────────────────────────────────────
# 双下划线开头的属性触发名称改写（name mangling）：__name 变成 _PrivateDog__name，
# 从类外部直接用 instance.__name 访问会 AttributeError，只能走 get_name()。
# 用不同的类名 PrivateDog，同样避免覆盖。
class PrivateDog:
    def __init__(self, name, age):
        self.__name = name                # 私有属性
        self.age = age

    def get_name(self):
        return self.__name                # 类内部可以正常访问


private_dog = PrivateDog("Buddy", 3)
print(private_dog.get_name())             # Buddy
# print(private_dog.__name)               # AttributeError: 'PrivateDog' object has no attribute '__name'

# 想看被改写成什么名字，可以用 __dict__：
print(private_dog.__dict__)               # {'_PrivateDog__name': 'Buddy', 'age': 3}
